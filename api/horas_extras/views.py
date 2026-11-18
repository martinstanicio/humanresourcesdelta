from datetime import date, datetime, time
from uuid import UUID

from django.db import transaction
from django.db.models import QuerySet
from django.http import QueryDict
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from empleados.models import Empleado, RolEmpleado
from reportes.models import Reporte

from .calculo import (
    calcular_desglose,
    resolver_hora_extra_para_condicion,
)
from .models import (
    EstadoNotificacionHorasExtras,
    HoraExtra,
    NotificacionHorasExtras,
)
from .serializers import (
    HoraExtraSerializer,
    NotificacionHorasExtrasSerializer,
    ResolverNotificacionHorasExtrasSerializer,
)


class HoraExtraListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[HoraExtra]:
        queryset = HoraExtra.objects.all()
        user = request.user

        if isinstance(user, Empleado) and user.rol == RolEmpleado.EMPLEADO:
            if user.convenio is None:
                return queryset.none()
            return queryset.filter(convenio=user.convenio, activo=True)

        convenio = request.query_params.get("convenio")
        if convenio is not None:
            queryset = queryset.filter(convenio_id=convenio)

        activo = request.query_params.get("activo")
        if activo is not None:
            if activo.lower() in ["si", "true", "1"]:
                return queryset.filter(activo=True).order_by("tipo")
            elif activo.lower() in ["no", "false", "0"]:
                active_codigos = HoraExtra.objects.filter(activo=True).values_list(
                    "codigo", flat=True
                )
                return (
                    queryset
                    .exclude(codigo__in=active_codigos)
                    .order_by("codigo", "-fecha_modificacion")
                    .distinct("codigo")
                )

        return queryset.order_by("codigo", "-fecha_modificacion").distinct("codigo")

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = HoraExtraSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = HoraExtraSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HoraExtraDetailView(APIView):
    def get(self, request: Request, codigo: UUID) -> Response:
        hora_extra = (
            HoraExtra.objects
            .filter(codigo=codigo)
            .order_by("-fecha_modificacion")
            .first()
        )
        if not hora_extra:
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and hora_extra.convenio != user.convenio
        ):
            return Response(
                {"detail": "No tienes permiso para ver esta hora extra."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = HoraExtraSerializer(hora_extra)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, codigo: UUID) -> Response:
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        hora_extra = (
            HoraExtra.objects
            .filter(codigo=codigo)
            .order_by("-fecha_modificacion")
            .first()
        )
        if not hora_extra:
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if isinstance(request.data, QueryDict):
            req_data = request.data.dict()
        elif isinstance(request.data, dict):
            req_data = dict(request.data)
        else:
            req_data = {}

        sent_fields = set(req_data.keys())
        if sent_fields == {"activo"}:
            nuevo_activo = bool(req_data["activo"])
            if hora_extra.activo != nuevo_activo:
                hora_extra.activo = nuevo_activo
                hora_extra.save(update_fields=["activo"])
            return Response(
                HoraExtraSerializer(hora_extra).data, status=status.HTTP_200_OK
            )

        data = dict(HoraExtraSerializer(hora_extra).data)
        data.update(req_data)
        data.pop("id", None)
        data.pop("codigo", None)
        data.pop("fecha_modificacion", None)
        data.pop("fecha_creacion", None)
        data["activo"] = req_data.get("activo", True)

        serializer = HoraExtraSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            if hora_extra.activo:
                hora_extra.activo = False
                hora_extra.save(update_fields=["activo"])
            nueva_hora_extra = serializer.save(codigo=hora_extra.codigo)

        return Response(
            HoraExtraSerializer(nueva_hora_extra).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, codigo: UUID) -> Response:
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        hora_extra = (
            HoraExtra.objects
            .filter(codigo=codigo)
            .order_by("-fecha_modificacion")
            .first()
        )
        if not hora_extra:
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not hora_extra.activo:
            return Response(
                {"detail": "La hora extra ya se encuentra inactiva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hora_extra.activo = False
        hora_extra.save(update_fields=["activo"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class HoraExtraVersionDetailView(APIView):
    def get(self, _: Request, pk: int) -> Response:
        hora_extra = get_object_or_404(HoraExtra, pk=pk)
        serializer = HoraExtraSerializer(hora_extra)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HoraExtraHistorialListView(APIView):
    def get(self, _: Request, codigo: UUID) -> Response:
        versiones = HoraExtra.objects.filter(codigo=codigo).order_by(
            "-fecha_modificacion"
        )
        if not versiones.exists():
            return Response(
                {"detail": "No se encontró la hora extra."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = HoraExtraSerializer(versiones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificacionHorasExtrasCalcularView(APIView):
    def get(self, request: Request) -> Response:
        fecha_str = request.query_params.get("fecha")
        hora_inicio_str = request.query_params.get("hora_inicio")
        hora_fin_str = request.query_params.get("hora_fin")

        if not fecha_str or not hora_inicio_str or not hora_fin_str:
            return Response(
                {
                    "detail": "Los parámetros fecha, hora_inicio y hora_fin son obligatorios."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            fecha_val = date.fromisoformat(fecha_str)
            h_ini_val = time.fromisoformat(hora_inicio_str)
            h_fin_val = time.fromisoformat(hora_fin_str)
        except ValueError:
            return Response(
                {"detail": "Formato inválido de fecha (YYYY-MM-DD) o de hora (HH:MM)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if h_fin_val <= h_ini_val:
            return Response(
                {
                    "detail": (
                        "La hora de fin debe ser posterior a la hora de inicio. "
                        "Si las horas extras abarcan dos días, deben realizarse dos notificaciones, una por cada día."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            desglose = calcular_desglose(fecha_val, h_ini_val, h_fin_val)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(desglose, status=status.HTTP_200_OK)


class NotificacionHorasExtrasListCreateView(APIView):
    def get_queryset(self, request: Request) -> QuerySet[NotificacionHorasExtras]:
        queryset = NotificacionHorasExtras.objects.all().order_by(
            "-fecha", "-hora_inicio"
        )
        user = request.user

        if isinstance(user, Empleado) and user.rol == RolEmpleado.EMPLEADO:
            queryset = queryset.filter(empleado=user)

        if convenio := request.query_params.get("convenio"):
            queryset = queryset.filter(empleado__convenio_id=convenio)

        if empleado := request.query_params.get("empleado"):
            queryset = queryset.filter(empleado_id=empleado)

        if estado := request.query_params.get("estado"):
            queryset = queryset.filter(estado=estado.lower())

        return queryset

    def get(self, request: Request) -> Response:
        queryset = self.get_queryset(request)
        serializer = NotificacionHorasExtrasSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        user = request.user
        if not isinstance(user, Empleado):
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        if isinstance(data, list):
            serializer = NotificacionHorasExtrasSerializer(
                data=data,
                many=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            with transaction.atomic():
                instancias = serializer.save(empleado=user)
            return Response(
                NotificacionHorasExtrasSerializer(instancias, many=True).data,
                status=status.HTTP_201_CREATED,
            )

        if not isinstance(data, dict):
            return Response(
                {"detail": "Se esperaba un objeto JSON o lista de objetos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if isinstance(data, QueryDict):
            payload_dict = data.dict()
        else:
            payload_dict = dict(data)
        if "motivo" in payload_dict and "motivo_resolucion" not in payload_dict:
            payload_dict["motivo_resolucion"] = payload_dict.pop("motivo")

        fecha_val: date | None = None
        h_ini_val: time | None = None
        h_fin_val: time | None = None

        if "fecha_inicio" in payload_dict:
            fi = payload_dict["fecha_inicio"]
            if isinstance(fi, str):
                try:
                    dt = datetime.fromisoformat(fi)
                    fecha_val = dt.date()
                    h_ini_val = dt.time()
                except ValueError:
                    pass
        elif "fecha" in payload_dict and "hora_inicio" in payload_dict:
            try:
                raw_f = payload_dict["fecha"]
                fecha_val = (
                    date.fromisoformat(raw_f) if isinstance(raw_f, str) else raw_f
                )
                raw_hi = payload_dict["hora_inicio"]
                h_ini_val = (
                    time.fromisoformat(raw_hi) if isinstance(raw_hi, str) else raw_hi
                )
            except ValueError, TypeError:
                pass

        if "fecha_fin" in payload_dict:
            ff = payload_dict["fecha_fin"]
            if isinstance(ff, str):
                try:
                    dt = datetime.fromisoformat(ff)
                    h_fin_val = dt.time()
                except ValueError:
                    pass
        elif "hora_fin" in payload_dict:
            try:
                raw_hf = payload_dict["hora_fin"]
                h_fin_val = (
                    time.fromisoformat(raw_hf) if isinstance(raw_hf, str) else raw_hf
                )
            except ValueError, TypeError:
                pass

        if fecha_val is not None and h_ini_val is not None and h_fin_val is not None:
            if h_fin_val <= h_ini_val:
                return Response(
                    {
                        "detail": (
                            "La hora de fin debe ser posterior a la hora de inicio. "
                            "Si las horas extras abarcan dos días, deben realizarse dos notificaciones, una por cada día."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            dt_fin = datetime.combine(fecha_val, h_fin_val)
            if timezone.is_naive(dt_fin) and timezone.is_aware(timezone.now()):
                dt_fin = timezone.make_aware(dt_fin, timezone.get_current_timezone())

            if dt_fin > timezone.now():
                return Response(
                    {
                        "detail": "La fecha y hora de las horas extras debe ser anterior a la fecha actual."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Flujo alternativo #2: Período ya cerrado
            periodo_cerrado = Reporte.objects.filter(
                empleado=user,
                fecha_inicio__lte=fecha_val,
                fecha_fin__gte=fecha_val,
            ).exists()
            if periodo_cerrado:
                return Response(
                    {
                        "detail": (
                            "El período correspondiente a esta fecha ya se encuentra cerrado. "
                            "Para reclamos o solicitudes fuera de término, comuníquese con Recursos Humanos."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Superposición de intervalos
            superpuesta = NotificacionHorasExtras.objects.filter(
                empleado=user,
                fecha=fecha_val,
                estado__in=[
                    EstadoNotificacionHorasExtras.PENDIENTE,
                    EstadoNotificacionHorasExtras.APROBADA,
                ],
                hora_inicio__lt=h_fin_val,
                hora_fin__gt=h_ini_val,
            ).exists()
            if superpuesta:
                return Response(
                    {
                        "detail": "El rango de horarios seleccionado se superpone con otra notificación existente."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payload_dict["fecha"] = fecha_val.isoformat()
            payload_dict["hora_inicio"] = h_ini_val.strftime("%H:%M:%S")
            payload_dict["hora_fin"] = h_fin_val.strftime("%H:%M:%S")

            # Si no se mandó hora_extra explícita, dividir por tramos según calendario
            if "hora_extra" not in payload_dict and user.convenio is not None:
                motivo = payload_dict.get("motivo_resolucion", "")
                desglose = calcular_desglose(fecha_val, h_ini_val, h_fin_val)
                if len(desglose["tramos"]) > 1:
                    tramos_payload = []
                    for tramo in desglose["tramos"]:
                        he = resolver_hora_extra_para_condicion(
                            user.convenio, tramo["condicion"], fecha_val
                        )
                        tramos_payload.append({
                            "fecha": fecha_val.isoformat(),
                            "hora_inicio": tramo["hora_inicio"],
                            "hora_fin": tramo["hora_fin"],
                            "motivo_resolucion": motivo,
                            "hora_extra": he.pk if he else None,
                        })

                    serializer = NotificacionHorasExtrasSerializer(
                        data=tramos_payload,
                        many=True,
                        context={"request": request},
                    )
                    serializer.is_valid(raise_exception=True)
                    with transaction.atomic():
                        instancias = serializer.save(empleado=user)
                    return Response(
                        NotificacionHorasExtrasSerializer(instancias, many=True).data,
                        status=status.HTTP_201_CREATED,
                    )
                elif len(desglose["tramos"]) == 1:
                    he = resolver_hora_extra_para_condicion(
                        user.convenio, desglose["tramos"][0]["condicion"], fecha_val
                    )
                    if he:
                        payload_dict["hora_extra"] = he.pk

        serializer = NotificacionHorasExtrasSerializer(
            data=payload_dict,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        instancia = serializer.save(empleado=user)

        return Response(
            NotificacionHorasExtrasSerializer(instancia).data,
            status=status.HTTP_201_CREATED,
        )


class NotificacionHorasExtrasDetailView(APIView):
    def get(self, request: Request, pk: int) -> Response:
        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        user = request.user

        if (
            isinstance(user, Empleado)
            and user.rol == RolEmpleado.EMPLEADO
            and notificacion.empleado != user
        ):
            return Response(
                {"detail": "No tienes permiso para ver esta notificación."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = NotificacionHorasExtrasSerializer(notificacion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        user = request.user
        if not isinstance(user, Empleado) or user.rol != RolEmpleado.RECURSOS_HUMANOS:
            return Response(
                {"detail": "No tienes permiso para realizar esta acción."},
                status=status.HTTP_403_FORBIDDEN,
            )

        notificacion = get_object_or_404(NotificacionHorasExtras, pk=pk)
        serializer = ResolverNotificacionHorasExtrasSerializer(
            notificacion, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        new_notificacion = serializer.save()

        return Response(
            NotificacionHorasExtrasSerializer(new_notificacion).data,
            status=status.HTTP_200_OK,
        )

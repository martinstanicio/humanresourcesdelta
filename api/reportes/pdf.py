from datetime import datetime
from io import BytesIO
from zoneinfo import ZoneInfo

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from reportes.models import Reporte

tz_buenos_aires = ZoneInfo("America/Argentina/Buenos_Aires")


def generar_pdf_reporte_mensual(reporte: Reporte, es_parcial: bool = False) -> BytesIO:
    # Configuración del lienzo en memoria
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
    )

    # Paletas de estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1A365D"),
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#2B6CB0"),
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#2D3748"),
    )
    subsection_style = ParagraphStyle(
        "SubSectionHeading",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#4A5568"),
    )
    normal_style = ParagraphStyle(
        "NormalText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#2D3748"),
    )
    bold_style = ParagraphStyle(
        "BoldText",
        parent=normal_style,
        fontName="Helvetica-Bold",
    )
    audit_style = ParagraphStyle(
        "AuditText",
        parent=styles["Italic"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#718096"),
    )
    partial_banner_style = ParagraphStyle(
        "PartialBanner",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        alignment=1,
        textColor=colors.HexColor("#9B2C2C"),
    )

    elements = []

    # Banner destacado de Reporte Parcial si corresponde
    if es_parcial:
        banner_table = Table(
            [
                [
                    Paragraph(
                        "ATENCIÓN: REPORTE PARCIAL (EN CURSO - NO VINCULANTE)",
                        partial_banner_style,
                    )
                ]
            ],
            colWidths=[18 * cm],
        )
        banner_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FED7D7")),
                ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#E53E3E")),
                ("PADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ])
        )
        elements.append(banner_table)
        elements.append(Spacer(1, 0.3 * cm))

    # Encabezado institucional
    elements.append(Paragraph("SISTEMA DE RECURSOS HUMANOS - DELTA", audit_style))
    titulo = "Reporte Mensual de Liquidación"
    if es_parcial:
        titulo += " [REPORTE PARCIAL]"
    elements.append(Paragraph(titulo, title_style))
    periodo_str = f"{reporte.fecha_inicio.strftime('%m/%Y')} (del {reporte.fecha_inicio.strftime('%d/%m/%Y')} al {reporte.fecha_fin.strftime('%d/%m/%Y')})"
    elements.append(Paragraph(f"Período: {periodo_str}", subtitle_style))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(
        HRFlowable(
            width="100%",
            thickness=1.5,
            color=colors.HexColor("#CBD5E0"),
            spaceAfter=10,
        )
    )

    # Datos del Empleado
    empleado = reporte.empleado
    convenio_nombre = empleado.convenio.nombre if empleado.convenio else "Sin convenio"
    ingreso_str = (
        empleado.fecha_ingreso.strftime("%d/%m/%Y") if empleado.fecha_ingreso else "-"
    )

    datos_empleado = [
        [
            Paragraph("<b>Legajo:</b>", normal_style),
            Paragraph(str(empleado.legajo), normal_style),
            Paragraph("<b>Fecha de Ingreso:</b>", normal_style),
            Paragraph(ingreso_str, normal_style),
        ],
        [
            Paragraph("<b>Empleado:</b>", normal_style),
            Paragraph(empleado.nombre, normal_style),
            Paragraph("<b>Convenio:</b>", normal_style),
            Paragraph(convenio_nombre, normal_style),
        ],
    ]
    tabla_emp = Table(datos_empleado, colWidths=[3 * cm, 6 * cm, 4 * cm, 5 * cm])
    tabla_emp.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FAFC")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    elements.append(tabla_emp)
    elements.append(Spacer(1, 0.5 * cm))

    # Sección Horas Extras (Consolidado)
    he_data = reporte.calcular_horas_extras()
    elements.append(
        Paragraph(
            "Liquidación de Horas Extras (Aprobadas en el Período)", section_style
        )
    )
    elements.append(Spacer(1, 0.15 * cm))

    filas_he = [
        [
            Paragraph("<b>Tipo de Hora Extra</b>", bold_style),
            Paragraph("<b>Horas Registradas</b>", bold_style),
        ]
    ]

    if he_data["desglose"]:
        for tipo, horas in he_data["desglose"].items():
            filas_he.append([
                Paragraph(tipo, normal_style),
                Paragraph(f"{horas:.1f} hs", normal_style),
            ])
        filas_he.append([
            Paragraph("<b>Total Horas Extras (Reloj)</b>", bold_style),
            Paragraph(f"<b>{he_data['total_horas_reloj']:.1f} hs</b>", bold_style),
        ])
    else:
        filas_he.append([
            Paragraph("<i>Sin horas extras liquidadas en el período</i>", normal_style),
            Paragraph("0.0 hs", normal_style),
        ])

    tabla_he = Table(filas_he, colWidths=[13 * cm, 5 * cm])
    tabla_he.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDF2F7")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ])
    )
    elements.append(tabla_he)

    # Detalle enriquecido de eventos de Horas Extras
    eventos_he = he_data.get("eventos", [])
    if eventos_he:
        elements.append(Spacer(1, 0.3 * cm))
        elements.append(
            Paragraph("Detalle de Eventos de Horas Extras", subsection_style)
        )
        elements.append(Spacer(1, 0.1 * cm))

        filas_ev_he = [
            [
                Paragraph("<b>Fecha Efectiva</b>", bold_style),
                Paragraph("<b>Tipo</b>", bold_style),
                Paragraph("<b>Horario</b>", bold_style),
                Paragraph("<b>Horas</b>", bold_style),
                Paragraph("<b>Fecha Aprobación</b>", bold_style),
            ]
        ]
        for ev in eventos_he:
            fecha_efectiva = ev["fecha"]
            try:
                dt_f = datetime.fromisoformat(fecha_efectiva)
                fecha_str = dt_f.strftime("%d/%m/%Y")
            except ValueError, TypeError:
                fecha_str = str(fecha_efectiva)

            h_ini = ev["hora_inicio"][:5] if ev.get("hora_inicio") else ""
            h_fin = ev["hora_fin"][:5] if ev.get("hora_fin") else ""
            horario_str = f"{h_ini} - {h_fin}" if (h_ini and h_fin) else "-"

            f_aprob = "-"
            if ev.get("fecha_aprobacion"):
                try:
                    dt_ap = datetime.fromisoformat(ev["fecha_aprobacion"])
                    f_aprob = dt_ap.strftime("%d/%m/%Y")
                except ValueError, TypeError:
                    f_aprob = str(ev["fecha_aprobacion"])[:10]

            filas_ev_he.append([
                Paragraph(fecha_str, normal_style),
                Paragraph(ev["tipo"], normal_style),
                Paragraph(horario_str, normal_style),
                Paragraph(f"{ev['horas']:.1f} hs", normal_style),
                Paragraph(f_aprob, normal_style),
            ])

        tabla_ev_he = Table(
            filas_ev_he, colWidths=[3.2 * cm, 4.8 * cm, 3.2 * cm, 2.8 * cm, 4 * cm]
        )
        tabla_ev_he.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F7FAFC")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("ALIGN", (3, 0), (3, -1), "RIGHT"),
                ("ALIGN", (4, 0), (4, -1), "CENTER"),
            ])
        )
        elements.append(tabla_ev_he)

    elements.append(Spacer(1, 0.6 * cm))

    # Sección Licencias (Consolidado)
    lic_data = reporte.calcular_licencias()
    elements.append(
        Paragraph("Desglose de Licencias (Días Efectivos en el Período)", section_style)
    )
    elements.append(Spacer(1, 0.15 * cm))

    filas_lic = [
        [
            Paragraph("<b>Tipo de Licencia</b>", bold_style),
            Paragraph("<b>Días Justificados</b>", bold_style),
        ]
    ]

    tipos_licencias = lic_data.get("desglose", {})
    if tipos_licencias:
        for tipo, dias in tipos_licencias.items():
            filas_lic.append([
                Paragraph(tipo, normal_style),
                Paragraph(f"{dias} días", normal_style),
            ])
        filas_lic.append([
            Paragraph("<b>Total Días de Licencia</b>", bold_style),
            Paragraph(f"<b>{lic_data['total']} días</b>", bold_style),
        ])
    else:
        filas_lic.append([
            Paragraph("<i>Sin licencias aprobadas en el período</i>", normal_style),
            Paragraph("0 días", normal_style),
        ])

    tabla_lic = Table(filas_lic, colWidths=[13 * cm, 5 * cm])
    tabla_lic.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDF2F7")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ])
    )
    elements.append(tabla_lic)

    # Detalle enriquecido de eventos de Licencias
    eventos_lic = lic_data.get("eventos", [])
    if eventos_lic:
        elements.append(Spacer(1, 0.3 * cm))
        elements.append(Paragraph("Detalle de Eventos de Licencias", subsection_style))
        elements.append(Spacer(1, 0.1 * cm))

        filas_ev_lic = [
            [
                Paragraph("<b>Tipo de Licencia</b>", bold_style),
                Paragraph("<b>Inicio Efectivo</b>", bold_style),
                Paragraph("<b>Fin Efectivo</b>", bold_style),
                Paragraph("<b>Días en Mes</b>", bold_style),
            ]
        ]
        for ev in eventos_lic:
            try:
                ini_str = datetime.fromisoformat(ev["inicio_efectivo"]).strftime(
                    "%d/%m/%Y"
                )
            except ValueError, TypeError:
                ini_str = str(ev.get("inicio_efectivo", "-"))

            try:
                fin_str = datetime.fromisoformat(ev["fin_efectivo"]).strftime(
                    "%d/%m/%Y"
                )
            except ValueError, TypeError:
                fin_str = str(ev.get("fin_efectivo", "-"))

            filas_ev_lic.append([
                Paragraph(ev["tipo"], normal_style),
                Paragraph(ini_str, normal_style),
                Paragraph(fin_str, normal_style),
                Paragraph(f"{ev['dias_en_periodo']} días", normal_style),
            ])

        tabla_ev_lic = Table(filas_ev_lic, colWidths=[6 * cm, 4 * cm, 4 * cm, 4 * cm])
        tabla_ev_lic.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F7FAFC")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("ALIGN", (3, 0), (3, -1), "RIGHT"),
            ])
        )
        elements.append(tabla_ev_lic)

    elements.append(Spacer(1, 0.8 * cm))

    # Pie de página: Fecha en que el Sistema generó el reporte
    if reporte.fecha_generacion:
        fecha_gen = reporte.fecha_generacion.astimezone(tz_buenos_aires).strftime(
            "%d/%m/%Y a las %H:%M:%S"
        )
    else:
        fecha_gen = datetime.now(tz_buenos_aires).strftime("%d/%m/%Y a las %H:%M:%S")

    elements.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#E2E8F0"),
            spaceAfter=6,
        )
    )

    leyenda_audit = f"Fecha de emisión del reporte: {fecha_gen}"
    if es_parcial:
        leyenda_audit += " — ESTADO: REPORTE PARCIAL (Sujeto a modificaciones antes del cierre del mes)"
    elements.append(Paragraph(leyenda_audit, audit_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer

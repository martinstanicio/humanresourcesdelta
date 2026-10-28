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


def generar_pdf_reporte_mensual(reporte: Reporte) -> BytesIO:

    # Configuración del "lienzo" en memoria"
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
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
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2B6CB0"),
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#2D3748"),
    )
    normal_style = ParagraphStyle(
        "NormalText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
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

    elements = []

    # Encabezado institucional
    elements.append(Paragraph("SISTEMA DE RECURSOS HUMANOS - DELTA", audit_style))
    elements.append(Paragraph("Reporte Mensual de Liquidación", title_style))
    periodo_str = f"{reporte.fecha_inicio.strftime('%m/%Y')} (del {reporte.fecha_inicio.strftime('%d/%m/%Y')} al {reporte.fecha_fin.strftime('%d/%m/%Y')})"
    elements.append(Paragraph(f"Período: {periodo_str}", subtitle_style))
    elements.append(Spacer(1, 0.4 * cm))
    elements.append(
        HRFlowable(
            width="100%",
            thickness=1.5,
            color=colors.HexColor("#CBD5E0"),
            spaceAfter=15,
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
    tabla_emp = Table(datos_empleado, colWidths=[3 * cm, 5.5 * cm, 4 * cm, 4.5 * cm])
    tabla_emp.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FAFC")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    elements.append(tabla_emp)
    elements.append(Spacer(1, 0.8 * cm))

    # Sección Horas Extras
    he_data = reporte.calcular_horas_extras()
    elements.append(Paragraph("Desglose de Horas Extras", section_style))
    elements.append(Spacer(1, 0.2 * cm))

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
            Paragraph("<i>Sin horas extras aprobadas en el período</i>", normal_style),
            Paragraph("0.0 hs", normal_style),
        ])

    tabla_he = Table(filas_he, colWidths=[12 * cm, 5 * cm])
    tabla_he.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDF2F7")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ])
    )
    elements.append(tabla_he)
    elements.append(Spacer(1, 0.8 * cm))

    # Sección Licencias
    lic_data = reporte.calcular_licencias()
    elements.append(Paragraph("Desglose de Licencias", section_style))
    elements.append(Spacer(1, 0.2 * cm))

    filas_lic = [
        [
            Paragraph("<b>Tipo de Licencia</b>", bold_style),
            Paragraph("<b>Días Justificados</b>", bold_style),
        ]
    ]

    tipos_licencias = {k: v for k, v in lic_data.items() if k != "total"}
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

    tabla_lic = Table(filas_lic, colWidths=[12 * cm, 5 * cm])
    tabla_lic.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDF2F7")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ])
    )
    elements.append(tabla_lic)
    elements.append(Spacer(1, 1.2 * cm))

    # Pie de página: Fecha en que el Sistema generó el reporte
    if reporte.fecha_generacion:
        fecha_gen = reporte.fecha_generacion.astimezone(tz_buenos_aires).strftime("%d/%m/%Y a las %H:%M:%S")
    else:
        fecha_gen = datetime.now(tz_buenos_aires).strftime("%d/%m/%Y a las %H:%M:%S")

    elements.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#E2E8F0"),
            spaceAfter=8,
        )
    )
    elements.append(
        Paragraph(
            f"Fecha de generación del reporte: {fecha_gen}",
            audit_style,
        )
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer

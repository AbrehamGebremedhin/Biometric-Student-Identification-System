import os
from docx import Document
from docx.shared import Pt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from Management.models import Attendance, Course, Student


class ReportGenerator:
    def __init__(self, report_data_name='report', output_dir_name='output'):
        self.report_data = report_data_name
        self.output_dir = output_dir_name

    def create_word_files(self, room_data, term, exam_type):
        course_docs = {}
        output_dir = self.output_dir
        file_paths = []

        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)

        def add_paragraph(doc, text, bold=True, font_size=12):
            """ Helper function to add a formatted paragraph to the document. """
            paragraph = doc.add_paragraph()
            run = paragraph.add_run(text)
            run.bold = bold
            run.font.size = Pt(font_size)

        for room in room_data:
            room_no = room['ROOM_NO']

            for course in room['STUDENT_LIST']:
                course_code = course['course_code']
                course_data = Course.objects.filter(
                    COURSE_CODE=course_code, TERM=term).first()

                # Fetch or create the document for the course
                doc = course_docs.get(course_code, Document())
                course_docs[course_code] = doc

                # Insert a page break if the document already has content
                if len(doc.paragraphs) > 0:
                    doc.add_page_break()

                # Add exam information, course code, and room number
                add_paragraph(doc, f"\t\t\tExam:\t\t{term} / {exam_type}")
                add_paragraph(doc, f'\t\t\tCourse:\t\t{course_code}')
                add_paragraph(doc, f"\t\t\tCourse Name:\t\t{
                              course_data.COURSE_NAME}")
                add_paragraph(doc, f"\t\t\tRoom:\t\t{room_no}")

                # Create or add to the table
                table = doc.add_table(rows=1, cols=3)
                table.style = 'Table Grid'

                # Set the table headers
                hdr_cells = table.rows[0].cells
                hdr_cells[0].text = 'No.'
                hdr_cells[1].text = 'Name'
                hdr_cells[2].text = 'Batch'

                # Populate table with student data
                for idx, student_id in enumerate(course['students'], start=1):
                    student = Student.objects.get(STUDENT_ID=student_id)
                    row_cells = table.add_row().cells
                    row_cells[0].text = str(idx)
                    row_cells[1].text = student.STUDENT_NAME
                    row_cells[2].text = student.STUDENT_BATCH

        # Save each course's document after all rooms are added
        for course_code, doc in course_docs.items():
            file_path = os.path.join(output_dir, f"{course_data.COURSE_NAME}({course_code}) {
                                     exam_type} - Sitting Arrangement.docx")
            doc.save(file_path)
            file_paths.append(file_path)

        return file_paths

    def generate_report(self, criteria, value, output_dir='output', file_type='docx'):
        # Query the Attendance model based on the criteria
        if criteria == 'ROOM_NO':
            attendances = Attendance.objects.filter(ROOM_NO__ROOM_NO=value)
        elif criteria == 'COURSE_CODE':
            attendances = Attendance.objects.filter(
                EXAM_ID__COURSE_CODE__COURSE_CODE=value)
        elif criteria == 'create postman description for the inputs and parameters of all endpoints':
            attendances = Attendance.objects.filter(
                STUDENT_ID__STUDENT_BATCH=value)
        else:
            raise ValueError(
                "Invalid criteria. Choose from 'ROOM_NO', 'COURSE_CODE', or 'STUDENT_BATCH'.")

        # Define header columns for the report
        headers = ['No.', 'Student Name', 'Course Code',
                   'Room No.', 'Attendance Status']

        def populate_data(data):
            """ Helper function to map attendance data into rows. """
            return [
                [str(idx), attendance.STUDENT_ID.STUDENT_NAME,
                 attendance.EXAM_ID.COURSE_CODE.COURSE_CODE,
                 attendance.ROOM_NO.ROOM_NO,
                 'Present' if attendance.ATTENDANCE_STATUS else 'Absent']
                for idx, attendance in enumerate(data, start=1)
            ]

        if file_type == 'docx':
            # Create a new document
            doc = Document()

            # Add title to the document
            title = doc.add_heading(level=1).add_run(
                f'Attendance Report by {criteria}: {value}')
            title.bold = True
            title.font.size = Pt(16)

            # Create a table and add headers
            table = doc.add_table(rows=1, cols=len(headers))
            table.style = 'Table Grid'
            hdr_cells = table.rows[0].cells
            for i, header in enumerate(headers):
                hdr_cells[i].text = header

            # Populate the table with attendance data
            for row_data in populate_data(attendances):
                row_cells = table.add_row().cells
                for i, cell_text in enumerate(row_data):
                    row_cells[i].text = cell_text

            # Save the document
            file_path = os.path.join(output_dir, f"Attendance_Report_{
                                     criteria}_{value}.docx")
            doc.save(file_path)

        elif file_type == 'pdf':
            # Create a new PDF
            file_path = os.path.join(output_dir, f"Attendance_Report_{
                                     criteria}_{value}.pdf")
            c = canvas.Canvas(file_path, pagesize=letter)
            width, height = letter

            # Set fonts and draw title
            c.setFont("Helvetica-Bold", 16)
            c.drawString(100, height - 50,
                         f'Attendance Report by {criteria}: {value}')

            # Set headers for the table
            y_position = height - 100
            c.setFont("Helvetica-Bold", 12)
            for i, header in enumerate(headers):
                c.drawString(50 + i * 100, y_position, header)

            # Populate the table with attendance data
            y_position -= 20
            c.setFont("Helvetica", 12)
            for row_data in populate_data(attendances):
                for i, cell_text in enumerate(row_data):
                    c.drawString(50 + i * 100, y_position, cell_text)
                y_position -= 20
                # Start a new page if we reach the bottom
                if y_position < 50:
                    c.showPage()
                    c.setFont("Helvetica", 12)  # Reset font for the new page
                    y_position = height - 50

            # Save the PDF
            c.save()

        else:
            raise ValueError("Invalid file type. Choose 'docx' or 'pdf'.")

        return file_path

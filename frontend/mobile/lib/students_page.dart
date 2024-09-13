import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class StudentsPage extends StatefulWidget {
  final String selectedRoom;
  final String selectedSession;

  const StudentsPage(
      {super.key, required this.selectedRoom, required this.selectedSession});

  @override
  // ignore: library_private_types_in_public_api
  _StudentsPageState createState() => _StudentsPageState();
}

class _StudentsPageState extends State<StudentsPage> {
  bool isLoading = true;
  List<dynamic> students = [];

  @override
  void initState() {
    super.initState();
    fetchStudents();
  }

  Future<void> fetchStudents() async {
    final String apiUrl =
        'http://192.168.0.102:8000/api/v1/attendances/?STUDENT_ID&COURSE_CODE&ROOM_NO=${widget.selectedRoom}&EXAM_TIME=${widget.selectedSession}';

    try {
      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        setState(() {
          students = json.decode(response.body);
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
        throw Exception('Failed to load students');
      }
    } catch (error) {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> markAttendance(String studentId, String courseCode) async {
    final String attendanceApiUrl =
        'http://192.168.0.102:8000/api/v1/attendances/no-image/?room_no=${widget.selectedRoom}&exam_time=${widget.selectedSession}&student_id=$studentId&course_code=$courseCode';

    try {
      final response = await http.patch(Uri.parse(attendanceApiUrl));

      if (response.statusCode == 202) {
        // Attendance marked successfully
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Attendance marked')),
        );

        // Refresh the student list after marking attendance
        await fetchStudents();
      } else {
        throw Exception('Failed to mark attendance');
      }
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Students'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: students.length,
              itemBuilder: (context, index) {
                final student = students[index]['student_id'];
                final course = students[index]['exam_id']['course_code'];
                return ListTile(
                  title: Text(student['STUDENT_NAME']),
                  subtitle: Text(
                      'ID: ${student['STUDENT_ID']} - Batch: ${student['STUDENT_BATCH']}'),
                  trailing: students[index]['ATTENDANCE_STATUS']
                      ? const ElevatedButton(
                          onPressed: null,
                          child: Text('Attended'),
                        )
                      : ElevatedButton(
                          onPressed: () => markAttendance(
                              student['STUDENT_ID'], course['COURSE_CODE']),
                          child: const Text('Marked Attendance'),
                        ),
                );
              },
            ),
    );
  }
}

import 'package:flutter/material.dart';
import 'dart:io';
import 'check_student_result_page.dart';

class ResultsPage extends StatelessWidget {
  final int statusCode;
  final File image;
  final Map<String, dynamic> responseData;

  const ResultsPage({
    super.key,
    required this.statusCode,
    required this.image,
    required this.responseData,
  });

  @override
  Widget build(BuildContext context) {
    if (statusCode == 202) {
      final studentData = responseData;
      return Scaffold(
        appBar: AppBar(title: const Text('Student')),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ListView(
            children: [
              Card(
                child: ListTile(
                  title: Text('Name: ${studentData['student_name']}'),
                  subtitle: Text('ID: ${studentData['student_id']}'),
                ),
              ),
              Card(
                child: ListTile(
                  title: Text('Batch: ${studentData['student_batch']}'),
                ),
              ),
              Card(
                child: ListTile(
                  title: Text('Room: ${studentData['room_no']}'),
                  subtitle: Text(
                      'Takes: ${studentData['exam']} - ${studentData['course_code']}'),
                ),
              ),
              // Add more student details
            ],
          ),
        ),
      );
    } else if (statusCode == 400) {
      return Scaffold(
        appBar: AppBar(title: const Text('Student Results')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Invalid image. Please take another picture.',
                style: TextStyle(fontSize: 18),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: const Text('Retake Picture'),
              ),
            ],
          ),
        ),
      );
    } else if (statusCode == 404) {
      return Scaffold(
        appBar: AppBar(title: const Text('Student Results')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Student not found. Do you want to check the student?',
                style: TextStyle(fontSize: 18),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          CheckStudentResultPage(image: image),
                    ),
                  );
                },
                child: const Text('Check Student'),
              ),
            ],
          ),
        ),
      );
    } else {
      return Scaffold(
        appBar: AppBar(title: const Text('Student Results')),
        body: const Center(
          child: Text(
            'Unexpected error occurred.',
            style: TextStyle(fontSize: 18),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }
  }
}

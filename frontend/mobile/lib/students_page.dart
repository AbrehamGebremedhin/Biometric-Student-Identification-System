import 'package:flutter/material.dart';

class StudentsPage extends StatelessWidget {
  final List<Map<String, String>> students = [
    {"name": "Cindy", "grade": "Grade 3", "age": "Age 9"},
    {"name": "Evelyn", "grade": "Grade 3", "age": "Age 8"},
    {"name": "Liam", "grade": "Grade 3", "age": "Age 8"},
    {"name": "Mia", "grade": "Grade 3", "age": "Age 8"},
  ];

  StudentsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: students.length,
      itemBuilder: (context, index) {
        return ListTile(
          leading: const CircleAvatar(
            backgroundImage: NetworkImage(
                'https://via.placeholder.com/150'), // Placeholder for student image
          ),
          title: Text(students[index]["name"]!),
          subtitle:
              Text('${students[index]["grade"]}, ${students[index]["age"]}'),
        );
      },
    );
  }
}

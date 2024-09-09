import 'package:flutter/material.dart';

class ResultPage extends StatelessWidget {
  final Map<String, dynamic> result;

  const ResultPage({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Result')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Student Name: ${result['name']}'),
            Text('Batch: ${result['batch']}'),
            Text('ID: ${result['id']}'),
            const SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                onPressed: () {
                  // Navigate back to the home page's camera tab
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                child: const Text('Go to Camera'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

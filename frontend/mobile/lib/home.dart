import 'package:flutter/material.dart';
import 'camera_page.dart'; // Import the camera page
import 'students_page.dart'; // Import the students page

class HomePage extends StatefulWidget {
  final String selectedRoom;
  final String selectedSession;

  const HomePage(
      {super.key, required this.selectedRoom, required this.selectedSession});

  @override
  // ignore: library_private_types_in_public_api
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 1;

  // Pages list for navigation
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      CameraPage(
          selectedRoom: widget.selectedRoom,
          selectedSession: widget.selectedSession), // Camera Page
      StudentsPage(
          selectedRoom: widget.selectedRoom,
          selectedSession: widget.selectedSession), // Students Page
    ];
  }

  void _onTabTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title:
            Text('Home - ${widget.selectedRoom} - ${widget.selectedSession}'),
        centerTitle: true,
      ),
      body: _pages[_selectedIndex], // Display the selected page
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onTabTapped,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.camera_alt),
            label: 'Camera',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Students',
          ),
        ],
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        showSelectedLabels: true,
        showUnselectedLabels: true,
      ),
    );
  }
}

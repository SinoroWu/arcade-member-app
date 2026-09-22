import 'package:flutter/material.dart';
import 'core/theme/arcade_theme.dart';

void main() {
  runApp(const ArcadeMemberApp());
}

class ArcadeMemberApp extends StatelessWidget {
  const ArcadeMemberApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ARCADE PASS',
      theme: ArcadeTheme.themeData,
      debugShowCheckedModeBanner: false,
      home: const MainTabScreen(),
    );
  }
}

class MainTabScreen extends StatefulWidget {
  const MainTabScreen({Key? key}) : super(key: key);

  @override
  State<MainTabScreen> createState() => _MainTabScreenState();
}

class _MainTabScreenState extends State<MainTabScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const MemberCardView(),
    const WalletView(),
    const MallView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_2),
            label: '會員卡',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet),
            label: '我的錢包',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.card_giftcard),
            label: '兌換商城',
          ),
        ],
      ),
    );
  }
}

class MemberCardView extends StatelessWidget {
  const MemberCardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ARCADE PASS')),
      body: Center(
        child: Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: ArcadeTheme.cardBg,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: ArcadeTheme.neonCyan.withOpacity(0.4), width: 2),
            boxShadow: [
              BoxShadow(
                color: ArcadeTheme.neonCyan.withOpacity(0.15),
                blurRadius: 24,
                spreadRadius: 4,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('VIP 黃金尊爵', style: TextStyle(color: ArcadeTheme.neonGold, fontWeight: FontWeight.bold, fontSize: 16)),
                  Icon(Icons.shield_outlined, color: ArcadeTheme.neonCyan),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.qr_code_scanner, size: 180, color: Colors.black),
              ),
              const SizedBox(height: 16),
              const Text('30 秒動態防偽自動輪替', style: TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}

class WalletView extends StatelessWidget {
  const WalletView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('數位資產錢包')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          ListTile(
            tileColor: ArcadeTheme.cardBg,
            leading: Icon(Icons.monetization_on, color: ArcadeTheme.neonCyan),
            title: Text('遊戲代幣 (Tokens)'),
            trailing: Text('1,280 枚', style: TextStyle(color: ArcadeTheme.neonCyan, fontWeight: FontWeight.bold, fontSize: 18)),
          ),
          SizedBox(height: 12),
          ListTile(
            tileColor: ArcadeTheme.cardBg,
            leading: Icon(Icons.confirmation_number, color: ArcadeTheme.neonPink),
            title: Text('機台彩票 (Tickets)'),
            trailing: Text('4,650 張', style: TextStyle(color: ArcadeTheme.neonPink, fontWeight: FontWeight.bold, fontSize: 18)),
          ),
        ],
      ),
    );
  }
}

class MallView extends StatelessWidget {
  const MallView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('景品與票券商城')),
      body: const Center(child: Text('商城景品與電子票券兌換')),
    );
  }
}

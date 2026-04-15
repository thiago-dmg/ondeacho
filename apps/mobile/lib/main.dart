import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:shared_preferences/shared_preferences.dart";
import "core/routing/app_router.dart";
import "core/storage/shared_prefs_provider.dart";
import "core/theme/app_theme.dart";

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final preferences = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(preferences)],
      child: const OndeAchoApp()
    )
  );
}

class OndeAchoApp extends ConsumerWidget {
  const OndeAchoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: "OndeAcho",
      theme: AppTheme.light,
      debugShowCheckedModeBanner: false,
      routerConfig: router
    );
  }
}

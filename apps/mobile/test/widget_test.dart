import "package:flutter_test/flutter_test.dart";
import "package:onde_acho_mobile/main.dart";

void main() {
  testWidgets("renderiza app principal", (WidgetTester tester) async {
    await tester.pumpWidget(const OndeAchoApp());
    expect(find.text("OndeAcho - Entrar"), findsOneWidget);
  });
}

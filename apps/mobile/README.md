# App Flutter OndeAcho

Aplicativo mobile para Android/iOS com foco em descoberta de clinicas e profissionais para TEA/TDAH.

## API (base URL)

O padrão compilado aponta para **`https://api.ondeachotea.com/api/v1`** (ver `lib/core/network/api_client.dart`).  
Para desenvolver contra o backend na máquina local:

- **Android (emulador):** `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1`
- **iOS Simulator:** `flutter run --dart-define=API_BASE_URL=http://127.0.0.1:3000/api/v1`
- **Dispositivo físico:** use o IP da sua rede local, ex. `http://192.168.x.x:3000/api/v1`

No modo debug, a URL efetiva é impressa no console: `[OndeAcho] API_BASE_URL=...`

Escopo inicial:
- autenticacao;
- busca com filtros;
- detalhe do atendimento;
- favoritos;
- avaliacoes.

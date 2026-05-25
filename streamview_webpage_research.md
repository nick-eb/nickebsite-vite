# Streamview Webpage Research Document

Product naming note: the current repository and code use the name `Skyview`. This document uses `Streamview` as the coming-soon public/product name while referring to repo-level systems as Skyview where helpful.

## Purpose

This document is design source material for a public webpage that explains Streamview to both technical reviewers and non-technical users. It is not a webpage implementation. It summarizes the product story, architecture, reverse-engineering work, backend/frontend technologies, and credible resume-ready engineering highlights.

## One-Sentence Positioning

Streamview is a modern cross-platform monitoring system for Skystream/Skyview wind turbines, built around a reverse-engineered XBee/FTDI telemetry protocol, offline local logging, Raspberry Pi base-station support, and optional cloud sync for remote dashboards.

## Audience Split

The page needs to serve two audiences at once:

- Users: people who want to see turbine RPM, power, voltage, energy, history, and connectivity without wrestling with old software.
- Technical reviewers/employers: people evaluating systems skill across protocol reverse engineering, embedded/Linux appliance work, FastAPI backend design, Flutter frontend architecture, data modeling, deployment, and testing.

The webpage should avoid reading like a narrow dashboard clone. The stronger story is: old proprietary telemetry path revived, normalized, tested, logged locally, synced remotely, and packaged into a practical appliance/app experience.

## Product Summary

Streamview replaces an older Python/LabVIEW-like Skyview workflow with a modern monitoring stack. It reads turbine telemetry through a Sky Coord XBee USB receiver, decodes the radio/API frames, displays live turbine state, stores telemetry locally, and can sync data to a remote backend for account-based dashboards.

Core capabilities currently represented in the codebase:

- Live telemetry polling over FTDI serial/XBee.
- Protocol parser for XBee API frames and SIP telemetry packets.
- Live dashboard values for RPM, power, voltages, current, line frequency, temperatures, statuses, and RSSI.
- Local SQLite logging before UI or sync work.
- Guest mode for free local monitoring without an account.
- Signed-in mode for remote telemetry sync.
- FastAPI backend for auth, devices, telemetry ingest/query, admin views, and user dashboards.
- Raspberry Pi 4 appliance image with Flutter Web dashboard, local FastAPI/Pi API, kiosk mode, network setup AP, telemetry service, and signed OTA app updates.
- Historical energy decoding from `0x27` packets, with careful confidence labeling for fields still under investigation.

## Technical Feats To Highlight

### Reverse-Engineered Telemetry Protocol

Streamview communicates with a turbine through a Sky Coord XBee USB receiver. The transport is FTDI serial at `115200` baud. XBee API mode frames start with `0x7e`, include a big-endian length, payload, and checksum.

The protocol layer handles:

- XBee transmit request frames (`0x10`) for turbine polling.
- Local AT commands (`0x08`) such as `ND`, `DB`, `SH`, and `SL`.
- Remote AT commands (`0x17`) for broadcast node discovery.
- AT responses (`0x88`), transmit statuses (`0x8b`), RF receive frames (`0x90`/`0x91`), node identification (`0x95`), and remote AT responses (`0x97`).
- SIP packet framing inside RF data using `0x10 0x02` start and `0x10 0x03` end markers, including escaped DLE bytes.

Key telemetry discoveries:

- `0x05` packets contain live telemetry.
- `0x27` packets contain metadata/history-oriented data.
- Live dashboard words start at offset `20`.
- Raw fields are preserved as `f00` through `f32`.
- Metadata from `0x27` packets is cached/merged into future live samples.
- Raw values are kept for diagnostics even when UI-normalized values are shown.
- Sentinel-like idle/ready values are normalized for user display. Example: `65280 W` is treated as invalid/sentinel power and displayed as `0 W`; `256 rpm` can be an idle sentinel and normalizes to `0 rpm`.

Design angle: show this as careful hardware/software archaeology. The page can say Streamview does not just read an API; it reconstructs the original telemetry behavior from captured frames, a known-good old dashboard, golden fixtures, and parity tests.

### Cross-Language Parser Parity

The repo maintains separate Python and Dart protocol implementations:

- Python parser for the backend/Pi telemetry service.
- Dart parser for the Flutter app.

They intentionally stay separate but are checked against shared golden fixtures in `shared/protocol_fixtures/`. This is a strong technical credibility point: protocol fixes are expected to update fixture data and prove both parsers return the same expected values.

Suggested webpage language:

> Independent Python and Dart parsers are tested against shared golden telemetry fixtures, keeping the mobile app and base station aligned even as protocol discoveries evolve.

### Offline-First Monitoring

Streamview is designed to work locally without cloud dependency:

- Guest users can monitor and log turbine data without an account.
- SQLite is used for local telemetry storage.
- Samples are written locally before sync attempts.
- Failed sync leaves rows queued instead of dropping data.
- The Pi base station API must work over LAN or setup AP without internet.

This is important for rural/utility-style deployments where internet may be unavailable near the turbine.

### Raspberry Pi Base Station Appliance

The Raspberry Pi 4 image is a major product differentiator. It turns the monitoring stack into a local appliance:

- Flashable Raspberry Pi 4 arm64 image.
- Flutter Web dashboard served locally.
- HDMI kiosk mode through Chromium/Cage.
- Local USB telemetry service owns the FTDI/XBee receiver.
- Local SQLite storage under `/var/lib/skyview`.
- Network management service with Ethernet preference, saved Wi-Fi fallback, and setup access point.
- Setup AP SSID: `Skyview-Setup`.
- Base-station API on local port `8983` in the contract docs; production Pi web service serves dashboard/API locally.
- Systemd services for network, FTDI binding, telemetry, web, kiosk, thermal profile, and updater.
- Conservative Pi 4 thermal profile for kiosk stability.

Important service names:

- `skyview-network.service`
- `skyview-ftdi-bind.service`
- `skyview-web.service`
- `skyview-telemetry.service`
- `skyview-kiosk.service`
- `skyview-updater.path`
- `skyview-updater.service`

The telemetry service is deliberately the only USB owner. Browsers never open `/dev/ttyUSB*`; they consume the local API. This is a clean appliance architecture and worth explaining visually.

### Signed OTA Update System

The Pi appliance includes app-level OTA update support:

- Signed `manifest.json` checked with Ed25519.
- SHA-256 package verification.
- Versioned release directories under `/opt/skyview/releases/`.
- Symlink-style current backend and Flutter Web bundle replacement.
- Health check against `http://127.0.0.1/health`.
- Rollback support through previous/current release tracking.
- Updates preserve Wi-Fi config, local SQLite data, logs, and `/etc/skyview/pi.toml`.

This supports a public message like: Streamview is being built as a maintainable appliance, not a throwaway script.

### Backend Engineering

The backend is a Python/FastAPI service with both API and server-rendered dashboard surfaces.

Technologies:

- FastAPI
- SQLAlchemy
- PostgreSQL / TimescaleDB
- Alembic migrations
- Pydantic schemas
- Uvicorn
- Argon2 password hashing
- JWT access/refresh tokens
- DB-backed web sessions
- Jinja2 templates
- Static CSS/JS dashboard assets
- Docker / Docker Compose / Portainer deployment

Backend responsibilities:

- Account signup/login/refresh.
- User profile and entitlement plan.
- Device registration keyed by turbine remote address.
- Per-device poll configuration.
- Telemetry batch ingest.
- Idempotent sample acknowledgement using `client_sample_id`.
- Recent telemetry query.
- Range/history query for charts.
- Admin user/device views.
- Maintenance endpoints.
- Customer dashboard pages.

Core remote API endpoints:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /me`
- `GET /devices`
- `POST /devices`
- `PATCH /devices/{device_id}`
- `DELETE /devices/{device_id}`
- `GET /devices/{device_id}/latest`
- `GET /devices/{device_id}/config`
- `PATCH /devices/{device_id}/config`
- `POST /telemetry/batch`
- `GET /telemetry`
- `GET /dashboard`
- `GET /admin`

Telemetry database model:

- `users`
- `admins`
- `sessions`
- `web_sessions`
- `devices`
- `device_configs`
- `entitlements`
- `telemetry_samples`

Telemetry samples store fast indexed columns:

- `rpm`
- `power_w`
- `voltage_in`
- `current_out`
- `line_freq`
- `rssi_dbm`
- `kind`
- `recorded_at`
- `device_id`
- `client_sample_id`

They also preserve full raw/derived payloads:

- `fields`
- `derived`
- metadata
- ready/idle raw values
- sentinel evidence

This combination supports fast charting and diagnostics without throwing away unknown protocol data.

### TimescaleDB / Time-Series Work

When running on PostgreSQL, the backend initializes TimescaleDB features:

- `telemetry_samples` becomes a hypertable on `recorded_at`.
- Compression is enabled and segmented by `device_id`.
- Compression policy starts after 7 days.
- Continuous aggregate views are created for multiple bucket sizes.

Configured rollup buckets:

- `1 second`
- `5 seconds`
- `10 seconds`
- `30 seconds`
- `1 minute`
- `5 minutes`
- `15 minutes`
- `1 hour`
- `1 day`

Rollup metrics:

- `rpm`
- `power_w`
- `voltage_in`
- `current_out`
- `line_freq`
- `rssi_dbm`

This is a strong resume point because it shows time-series scaling thought beyond simply appending rows.

### Frontend Engineering

The primary app is Flutter/Dart, targeting Android first while keeping Windows, macOS, Linux, web/Pi, and possible iOS/iPadOS support in view.

Frontend technologies:

- Flutter
- Dart
- Material 3
- Noto Sans custom fonts
- `http` for API calls
- `sqflite` and `sqflite_common_ffi` for local storage
- `fl_chart` for history graphs
- `shared_preferences` for local settings/auth state
- Platform-specific Android USB integration in Kotlin
- Flutter Web for Pi dashboard/kiosk

App architecture:

- `TelemetryTransport`: platform transport abstraction.
- `SkyviewProtocol`: pure Dart protocol parser and frame builder.
- `TelemetryStore`: SQLite local persistence.
- `SyncService`: uploads queued samples when signed in.
- `AuthService`: signup, login, token refresh, guest mode, backend URL, sync state.
- `PiBaseStationController`: talks to Pi local API when running as appliance UI.
- `RuntimeMode`: detects normal app vs Pi appliance mode.

Current app behavior:

- User can continue as guest or sign in.
- Guest mode supports local monitoring/logging.
- Signed-in mode enables backend sync.
- Android USB communication works through FTDI/XBee.
- Main dashboard shows RPM and power dials.
- Embedded graph shows RPM and power history.
- Settings include account/sync/backend URL/debug status.
- Poll interval can be adjusted locally and remotely.
- Telemetry is persisted locally before sync.
- Sync uploads batches and leaves failed rows queued.

Design angle: the frontend is not only a UI. It owns a real protocol parser, durable local store, auth/sync workflow, and runtime modes for direct-device and Pi-appliance use.

### Android USB And Background Logging Direction

The app includes Android USB integration work for FTDI/XBee. The desired direction is:

- Auto-connect when supported USB device is plugged in before app launch.
- Initialize telemetry on the first manual USB tap.
- Prompt Android to open Streamview when a supported USB device is attached.
- Continue reading/logging in the background using a foreground service.

Known Android mechanisms:

- `android.hardware.usb.action.USB_DEVICE_ATTACHED`
- USB device filter XML
- Manifest intent filter and metadata
- Foreground service with persistent notification
- USB read loop owned by service
- UI binds/subscribes to service state

The webpage should avoid promising all future behavior as shipped if not yet done. Use “designed for” or “in development” for background logging and first-launch polish.

### Local Pi API

The Pi local API is designed to work without internet. Key endpoints include:

- `GET /pi/api/status`
- `GET /pi/api/fields`
- `POST /pi/api/wifi/scan`
- `GET /pi/api/wifi/scan/status`
- `POST /pi/api/wifi`
- `POST /pi/api/wifi/ap`
- `GET /pi/api/telemetry/latest`
- `GET /pi/api/telemetry/history`
- `POST /pi/api/history/retrieve`
- `GET /pi/api/history/retrieve`
- `POST /pi/api/turbines/scan`
- `GET /pi/api/turbines`
- `POST /pi/api/turbines`
- `POST /pi/api/turbines/{id}/active`
- `POST /pi/api/auth/guest`
- `POST /pi/api/auth/login`
- `POST /pi/api/sync`
- `POST /pi/api/sync/run`
- `GET /pi/api/ota/status`
- `POST /pi/api/ota/check`
- `POST /pi/api/ota/install`
- `POST /pi/api/ota/rollback`

This API enables phone/laptop/HDMI dashboard access while the Pi service owns the serial receiver.

### Historical Data Research

Historical decoding is intentionally conservative:

- Daily energy is derived from `0x27` cumulative `history_watt_hours` deltas.
- The verified counter is watt-hours.
- Old app daily `KWh` equals delta divided by `1000`, labeled as the next local graph day for 21:00 UTC buckets.
- `0xffffffff`-style cumulative energy sentinels are ignored.
- Delta comparison resumes after the next valid baseline.
- Retrieved daily `0x27` records do not yet prove RPM or power history fields by themselves.

The page can mention ongoing protocol research, but should not overclaim historical RPM/power if only daily energy is verified.

## Suggested Page Structure

### Hero

Headline options:

- `Streamview`
- `Modern turbine telemetry, rebuilt from the wire up`
- `A coming-soon monitoring system for Skystream/Skyview turbines`

Supporting copy:

Streamview brings live turbine monitoring, local logging, and optional cloud dashboards to hardware that previously depended on aging software. It combines reverse-engineered XBee telemetry, a Flutter app, a FastAPI backend, and a Raspberry Pi base-station mode.

Primary visual ideas:

- Real screenshot/dashboard mock showing RPM, watts, volts, and history graph.
- Small architecture strip: Turbine -> XBee/FTDI -> App/Pi -> SQLite -> Cloud dashboard.
- Coming-soon badge.

### For Users

Talk about outcomes:

- See live RPM, power, voltage, current, line frequency, signal strength, and turbine state.
- Monitor locally without an account.
- Keep local logs even when internet is unavailable.
- Sync history later when signed in.
- Use direct Android USB or a Raspberry Pi base station.
- View dashboard from phone/laptop/HDMI on local network.

Tone: simple, practical, reliability-focused.

### For Technical Reviewers

Talk about engineering:

- Reverse-engineered binary telemetry protocol.
- XBee API and SIP packet decoding.
- Python and Dart parser parity.
- Offline-first SQLite queue.
- FastAPI auth/device/telemetry backend.
- TimescaleDB hypertable and continuous aggregates.
- Raspberry Pi appliance image with systemd services.
- Signed OTA updates with rollback.
- Docker/Portainer deployment.

Tone: exact and specific.

### Architecture Section

Use a diagram like:

```text
Skystream/Skyview Turbine
        |
        | RF telemetry
        v
Sky Coord XBee Receiver
        |
        | FTDI serial, 115200 baud
        v
Streamview Protocol Layer
        |
        +--> Flutter app: live UI, local SQLite, sync queue
        |
        +--> Raspberry Pi service: polling, logging, local API, kiosk dashboard
        |
        v
FastAPI Backend
        |
        +--> Postgres/TimescaleDB telemetry storage
        +--> user dashboards
        +--> admin/device management
```

### Reverse Engineering Section

Suggested headings:

- `Decoded From Real Hardware`
- `Protocol-Aware, Not Screen-Scraped`
- `Raw Data Preserved`
- `Golden Fixtures Across Python and Dart`

Key message: Streamview treats unknown fields carefully. It preserves raw data, exposes diagnostics, and promotes fields to UI only when verified.

### Backend Section

Possible content blocks:

- `FastAPI account and device API`
- `Idempotent telemetry ingest`
- `Time-series database design`
- `Admin and customer dashboards`
- `Docker/Portainer deployment`

Suggested copy:

The backend stores both clean query columns and full raw telemetry maps, so charts stay fast while low-level diagnostics remain available. TimescaleDB rollups prepare long-running installations for high-volume telemetry without losing drill-down detail.

### Frontend Section

Possible content blocks:

- `Flutter cross-platform app`
- `USB/serial transport abstraction`
- `Local-first SQLite telemetry`
- `Guest mode and signed-in sync`
- `Pi appliance runtime`

Suggested copy:

The Flutter app is built as more than a display layer. It includes a pure Dart telemetry parser, local persistence, queued sync, runtime mode detection, and shared dashboard components for direct-device and Pi-base-station use.

### Appliance Section

Possible content blocks:

- `Raspberry Pi base station`
- `No internet required`
- `Setup AP for first boot`
- `HDMI kiosk mode`
- `Signed app updates`

Suggested copy:

For permanent installs, Streamview can run as a Raspberry Pi appliance. The Pi owns the USB receiver, logs telemetry locally, serves a dashboard over LAN or setup Wi-Fi, and can receive signed application updates without wiping local data.

### Trust / Caveats Section

Recommended honest caveats:

- Coming soon.
- Android FTDI path is first working direct transport.
- iOS/iPadOS remains future-friendly but not primary yet.
- Some historical protocol fields are still under research.
- Historical daily energy is verified; historical RPM/power should not be marketed as verified unless future captures prove it.

This section can be styled as “Built carefully” rather than negative caveats.

## Resume-Ready Technical Bullets

- Reverse-engineered XBee/FTDI turbine telemetry by comparing captured binary packets against a known-good legacy dashboard.
- Implemented independent Python and Dart parsers for XBee API frames, SIP packet framing, live telemetry, metadata, node discovery, RSSI, and history packets.
- Built golden-fixture protocol tests to keep backend/Pi and Flutter parsing behavior aligned.
- Designed offline-first telemetry logging with SQLite, WAL mode, queued sync, and idempotent backend acknowledgements.
- Built FastAPI backend with JWT auth, refresh tokens, DB-backed web sessions, SQLAlchemy models, Alembic migrations, device management, telemetry ingest, admin views, and customer dashboards.
- Modeled telemetry for both fast chart queries and low-level diagnostics by combining indexed summary columns with preserved raw/derived JSON payloads.
- Added TimescaleDB hypertables, compression, and continuous aggregates for long-term turbine time-series data.
- Built a Raspberry Pi 4 appliance image with systemd services for network setup, FTDI binding, telemetry polling, local web API, kiosk display, thermal profile, and OTA updates.
- Implemented signed OTA updates with Ed25519 manifest verification, SHA-256 package validation, health checks, release directories, and rollback.
- Built Flutter app architecture with transport abstraction, protocol parser, local SQLite store, auth/sync service, runtime modes, and charting UI.
- Designed local network/Pi APIs so browser dashboards never directly access USB devices; a dedicated service owns serial polling and exposes safe JSON endpoints.

## Technology List

Backend:

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- PostgreSQL
- TimescaleDB
- SQLite
- Pydantic
- Argon2
- JWT
- Jinja2
- Docker Compose
- Portainer

Frontend/app:

- Flutter
- Dart
- Material 3
- Kotlin Android USB integration
- SQLite via `sqflite`
- `sqflite_common_ffi`
- `fl_chart`
- `http`
- `shared_preferences`
- Flutter Web

Hardware/appliance:

- Raspberry Pi 4 arm64
- systemd
- Chromium/Cage kiosk mode
- FTDI serial
- XBee API mode
- hostapd/dnsmasq setup AP
- udev FTDI binding
- Ed25519 OTA signing

Testing/research:

- Python pytest
- Flutter tests
- Shared protocol golden fixtures
- Wireshark capture workflow
- Legacy dashboard comparison

## Visual/Content Ideas For Designer

- Architecture diagram with four lanes: Hardware, Local App, Pi Appliance, Cloud Backend.
- Protocol card showing bytes flowing into decoded fields: `0x7e -> XBee frame -> SIP packet -> 0x05 telemetry -> RPM/W/V`.
- Split user/technical cards: “For turbine owners” and “For engineering reviewers.”
- Small data model visual: fast columns plus raw JSON preservation.
- Timeline/story block: legacy software -> packet capture -> parser -> app -> backend -> Pi appliance.
- Dashboard close-up with live power/RPM graph.
- Pi base-station illustration/photo with labels for HDMI, USB receiver, LAN/Wi-Fi, local dashboard.
- “Coming soon” call-to-action for updates or beta interest.

## Claims Safe To Make

- Streamview is built around a reverse-engineered XBee/FTDI telemetry path.
- It uses Flutter for the app/frontend and FastAPI for the backend.
- It supports local SQLite logging and optional remote sync.
- It stores raw telemetry and derived values for diagnostics.
- It includes user accounts, device management, telemetry ingest, and dashboards.
- It includes a Raspberry Pi base-station/appliance path.
- It includes signed OTA update infrastructure for the Pi appliance.
- It is designed for offline/local use first.

## Claims To Avoid Or Qualify

- Do not claim all historical RPM/power fields are fully decoded unless future captures prove them.
- Do not imply iOS/iPadOS is fully supported today; say future-friendly.
- Do not claim public production readiness yet; use coming-soon/beta language.
- Do not say it works with every turbine model unless verified.
- Do not say background Android logging is finished unless the foreground service work is complete.

## Short Public Copy Draft

Streamview is a coming-soon monitoring system for Skystream/Skyview wind turbines. It reads live turbine data through the original XBee/FTDI receiver path, decodes the telemetry stream, and turns it into a modern dashboard with local logging and optional cloud sync.

Under the hood, Streamview combines reverse-engineered binary protocol parsing, a Flutter app, local SQLite storage, a FastAPI backend, and a Raspberry Pi base-station mode for always-on monitoring. It is designed to keep working locally when internet is unavailable, while still supporting signed-in remote dashboards when connectivity is available.

For technical reviewers: Streamview includes independent Python and Dart telemetry parsers, shared golden fixtures, idempotent telemetry ingest, PostgreSQL/TimescaleDB storage, Docker deployment, systemd-managed Pi services, and signed OTA updates.

## Longer Public Copy Draft

Streamview brings modern monitoring to Skystream/Skyview turbine installations. The project started by mapping the original telemetry behavior from a known-good legacy dashboard and real hardware captures, then rebuilding the stack with a protocol-aware Flutter app and FastAPI backend.

The app can monitor locally in guest mode, write telemetry to SQLite, display live RPM and power history, and queue samples for later sync. Signed-in users can upload telemetry to a remote backend for device dashboards and longer-term history. For permanent installs, a Raspberry Pi base station can own the USB receiver, serve a local dashboard over LAN or setup Wi-Fi, and continue collecting data without internet.

The engineering focus is reliability and traceability: raw packet fields are preserved, sentinel values are normalized without being discarded, and protocol behavior is tested against shared fixtures across Python and Dart.


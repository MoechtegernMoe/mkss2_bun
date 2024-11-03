# Roboter REST-API

Ein einfacher Microservice zur Steuerung eines Roboters in einer virtuellen Umgebung. Der Service bietet verschiedene REST-Endpunkte zur Navigation und Verwaltung des Roboterstatus.

## Setup

Für dieses Projekt wurde Bun verwendet, eine schnelle JavaScript- und TypeScript-Laufzeitumgebung. Bun kombiniert einen JavaScript- und TypeScript-Compiler, einen Package Manager und einen Webserver in einem Tool. Dadurch lassen sich TypeScript-Dateien direkt ausführen, was das Setup vereinfacht und die Entwicklung beschleunigt. Mit der nativen Unterstützung für TypeScript erleichtert Bun die Erstellung von performanten und gut strukturierten Anwendungen.

# Installation

Bun unterstützt Linux (x64 & arm64), macOS (x64 & Apple Silicon) und Windows (x64).
Das Projekt wurde lediglich mit Windows getestet und über npm installiert, das Setup wurde der Dokumentation von bun entnommen (https://bun.sh/docs/installation).

```sh
# mit install script (empfohlen)
curl -fsSL https://bun.sh/install | bash

# für windows
powershell -c "irm bun.sh/install.ps1 | iex"

# mit npm
npm install -g bun

# mit Homebrew
brew tap oven-sh/bun
brew install bun

# mit Docker
docker pull oven/bun
docker run --rm --init --ulimit memlock=-1:-1 oven/bun
```

### Ausführen
```bash
bun test                      # Unit Tests ausführen
bun run devStart              # startet den Server
```

## Funktionsübersicht

### 1. Roboter-Status abrufen
- **Methode**: `GET`
- **URL**: `/robot/{id}/status`
- **Beschreibung**: Liefert den aktuellen Status des Roboters, inklusive Position, Energielevel und Inventar.

### 2. Roboter bewegen
- **Methode**: `POST`
- **URL**: `/robot/{id}/move`
- **Payload**: `{ "direction": "up" }` (Richtungen: `up`, `down`, `left`, `right`)
- **Beschreibung**: Bewegt den Roboter in die angegebene Richtung.

### 3. Gegenstand aufheben/ablegen
- **Methode**: `POST`
- **URLs**:
    - **Aufheben**: `/robot/{id}/pickup/{itemId}`
    - **Ablegen**: `/robot/{id}/putdown/{itemId}`
- **Beschreibung**: Gegenstand mit der angegebenen ID aufheben oder ablegen.

### 4. Roboter-Zustand aktualisieren
- **Methode**: `PATCH`
- **URL**: `/robot/{id}/state`
- **Payload**: `{ "energy": 80 }` und/oder `{ "position": {"x": 20, "y": 10} }`
- **Beschreibung**: Aktualisiert Energielevel oder Position des Roboters.

### 5. Aktionen des Roboters abrufen
- **Methode**: `GET`
- **URL**: `/robot/{id}/actions`
- **Beschreibung**: Liste aller bisher durchgeführten Aktionen des Roboters (mit Pagination).

### 6. Roboter angreifen
- **Methode**: `POST`
- **URL**: `/robot/{id}/attack/{targetId}`
- **Beschreibung**: Führt einen Angriff auf einen anderen Roboter durch. Kostet 5% Energie des Angreifers.

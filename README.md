# CRT Cinema Donduseni - Sistem de Management

Sistem complet pentru gestionarea rezervărilor de bilete la cinema cu coduri QR trimise prin email, panou de administrare și sistem de feedback.

## Funcționalități

### 🎬 Pentru Public
- **Vizualizare filme**: Lista tuturor filmelor disponibile cu postere, descrieri și detalii
- **Rezervare bilete**: Formular de înregistrare cu nume, email și vârstă
- **Trimitere email automată**: Codul QR este trimis automat pe email-ul utilizatorului
- **Sistem feedback**: Evaluare a filmului și a organizării după vizionare

### 🔐 Pentru Admin
- **Panou de administrare**: Dashboard cu statistici
- **Gestionare filme**: Adăugare, editare și ștergere filme
- **Upload postere**: Posibilitatea de a încărca postere pentru filme
- **Setare restricții**: Definire limită vârstă și număr locuri
- **Scanner QR**: Scanare coduri QR la intrarea în sală
- **Validare acces**: Verificare vârstă și statut scanare
- **Vizualizare înregistrări**: Listă completă a participanților
- **Raport feedback**: Vizualizare evaluări și comentarii

### 🔒 Sistem de Securitate
- **Validare vârstă**: Verificare automată a restricțiilor de vârstă
- **Expirare coduri QR**: Codurile sunt valabile 2 zile după data filmului
- **Prevenire duplicate**: Un cod QR poate fi scanat o singură dată
- **Autentificare admin**: Sistem de login securizat (fără credențiale vizibile public)

## Instalare

### Cerințe
- Node.js (v14 sau mai nou)
- npm sau yarn

### Configurare Email

Pentru funcționalitatea de trimitere email-uri, trebuie să configurezi Gmail:

1. **Activează 2-Factor Authentication** pe contul tău Google
2. **Generează un App Password**:
   - Mergi la https://myaccount.google.com/apppasswords
   - Selectează "Mail" și "Other (Custom name)"
   - Dă-i un nume (ex: "CRT Cinema")
   - Copiază parola generată
3. **Configurează variabila de mediu**:
   - Creează un fișier `.env` în rădăcina proiectului
   - Adaugă: `EMAIL_PASSWORD=parola-generata`

### Pași de instalare

1. **Instalare dependențe principale**
```bash
npm install
```

2. **Instalare dependențe client**
```bash
cd client
npm install
cd ..
```

## Pornire Sistem

### Mod Dezvoltare (ambele servere)
```bash
npm run dev
```

### Server Backend separat
```bash
npm run server
```

### Client Frontend separat
```bash
npm run client
```

### Producție
```bash
npm run build
npm start
```

## Utilizare

### Acces Public
- **Site principal**: http://localhost:3000
- **Vizualizare filme**: Pagina principală afișează toate filmele disponibile
- **Rezervare**: Click pe "Rezervă Bilet" → Completare formular → Primire cod QR

### Acces Admin
- **Login Admin**: http://localhost:3000/admin
- **Credențiale implicite**:
  - Utilizator: `admin`
  - Parolă: `admin123`

### Flux de Lucru Admin

1. **Adăugare Film**
   - Navigare la Panou de Administrare
   - Click pe "Adaugă Film Nou"
   - Completare titlu, descriere, poster
   - Setare restricții vârstă (min/max)
   - Definire număr locuri disponibile
   - Selectare dată și oră

2. **Ziua Filmului**
   - Navigare la "Scanner QR"
   - Scanare coduri QR ale participanților
   - Sistemul verifică automat:
     - Validitatea codului QR
     - Dacă codul a expirat
     - Dacă a fost deja scanat
     - Dacă vârsta respectă restricțiile

3. **După Film**
   - Participanții pot accesa link-ul de feedback
   - Evaluare film (1-5 stele)
   - Evaluare organizare (1-5 stele)
   - Comentarii opționale

4. **Raportare**
   - Vizualizare înregistrări per film
   - Vizualizare feedback per film
   - Statistici generale în dashboard

## Structură Proiect

```
CRT CINEMA/
├── server/
│   └── index.js              # Backend API (Express + SQLite)
├── client/
│   ├── public/
│   │   └── index.html        # HTML principal
│   └── src/
│       ├── pages/
│       │   ├── Home.js       # Pagina principală (liste filme)
│       │   ├── Register.js   # Formular rezervare
│       │   ├── Admin.js      # Login admin
│       │   ├── AdminDashboard.js  # Panou administrare
│       │   ├── Scanner.js    # Scanner QR
│       │   └── Feedback.js   # Formular feedback
│       ├── App.js            # Router principal
│       ├── index.js          # Entry point
│       └── index.css         # Stiluri globale
├── uploads/                  # Fișiere încărcate (postere)
├── qrcodes/                  # Coduri QR generate
├── database.sqlite           # Baza de date SQLite
└── package.json              # Dependențe principale
```

## API Endpoints

### Filme
- `GET /api/movies` - Lista toate filmele
- `GET /api/movies/:id` - Detalii film
- `POST /api/movies` - Adaugă film nou (admin)
- `PUT /api/movies/:id` - Actualizează film (admin)
- `DELETE /api/movies/:id` - Șterge film (admin)

### Înregistrări
- `POST /api/register` - Rezervă bilet
- `GET /api/movies/:id/registrations` - Lista înregistrări (admin)

### QR Codes
- `POST /api/scan` - Scanează cod QR

### Feedback
- `POST /api/feedback` - Trimite feedback
- `GET /api/movies/:id/feedback` - Lista feedback (admin)

### Admin
- `POST /api/admin/login` - Autentificare admin
- `GET /api/admin/stats` - Statistici dashboard

## Baza de Date

Sistemul folosește SQLite cu următoarele tabele:

- **movies**: Filme disponibile (titlu, descriere, poster, restricții, locuri, dată)
- **registrations**: Înregistrări (nume, email, vârstă, cod QR, statut scanare)
- **feedback**: Evaluări (note film, organizare, comentarii)
- **admins**: Utilizatori admin

## Funcționalități Speciale

### Validare Vârstă
Sistemul verifică automat dacă vârsta participantului se încadrează în limitele setate pentru film. Dacă nu, înregistrarea este refuzată.

### Expirare Coduri QR
Codurile QR expiră automat după 2 zile de la data filmului. După expirare, nu mai pot fi scanate.

### Prevenire Scanare Multiplă
Fiecare cod QR poate fi scanat o singură dată. Încercările ulterioare arată că a fost deja scanat.

### Statistici în Timp Real
Dashboard-ul admin afișează statistici actualizate:
- Total filme
- Total înregistrări
- Înregistrări scanate
- Total feedback-uri

## Suport

Pentru întrebări sau probleme, contactați administratorul sistemului.

## Licență

Proiect proprietar CRT Cinema Donduseni.

# Accesare de pe Dispozitive Multiple

## Server Backend
Serverul rulează pe: **http://0.0.0.0:5000**

Adresa IP locală: **192.168.1.14**

## Accesare din Rețeaua Locală

### De pe alte dispozitive (telefon, tabletă, alt calculator):

1. **Asigură-te că toate dispozitivele sunt conectate la aceeași rețea Wi-Fi**

2. **Accesează serverul backend:**
   - URL: `http://192.168.1.14:5000`
   - Acesta este API-ul pentru filme, înregistrări, etc.

3. **Pentru frontend (dacă rulează React development server):**
   - După ce instalezi dependențele și pornești clientul cu `npm start` din folderul `client`
   - Frontend-ul va fi accesibil pe: `http://192.168.1.14:3000`

## Pornire Sistem

### Pasul 1: Instalare dependențe client
```bash
cd client
npm install
cd ..
```

### Pasul 2: Pornire server backend
```bash
npm run server
```
Serverul va porni pe http://0.0.0.0:5000

### Pasul 3: Pornire client frontend (opțional)
```bash
cd client
npm start
```
Clientul va porni pe http://0.0.0.0:3000

Sau porniți ambele simultan:
```bash
npm run dev
```

## Funcționalități localStorage

Sistemul salvează automat datele în localStorage pentru o experiență mai bună:

### Pentru utilizatori (pagina de rezervare):
- **Numele** - salvat automat la rezervare
- **Email-ul** - salvat automat la rezervare
- **Vârsta** - salvată automat la rezervare

La următoarea rezervare, aceste date vor fi precompletate automat.

### Pentru admin:
- **Numele de utilizator** - salvat la login
- La următorul login, numele de utilizator va fi precompletat

## Notă Importantă despre Firewall

Dacă nu poți accesa serverul de pe alte dispozitive:

1. **Verifică Firewall-ul Windows:**
   - Deschide "Windows Defender Firewall"
   - Click pe "Allow an app through firewall"
   - Asigură-te că Node.js are permisiune pe rețeaua privată

2. **Alternativ, dezactivează temporar firewall-ul pentru testare:**
   - Nu este recomandat pe termen lung
   - Folosește doar pentru testare

## Adrese de Acces

- **Local (pe acest calculator):**
  - Backend: http://localhost:5000
  - Frontend: http://localhost:3000

- **Din rețeaua locală (de pe telefon/tabletă):**
  - Backend: http://192.168.1.14:5000
  - Frontend: http://192.168.1.14:3000

## Troubleshooting

### Nu se accesează de pe telefon?
1. Verifică dacă telefonul este conectat la aceeași rețea Wi-Fi
2. Verifică dacă firewall-ul permite conexiuni
3. Verifică dacă serverul rulează (vezi terminalul)
4. Încearcă să accesezi http://192.168.1.14:5000 din browser

### Adresa IP s-a schimbat?
Rulează `ipconfig` în PowerShell pentru a vedea noua adresă IPv4

### Client React nu se conectează la backend?
Asigură-te că în `client/package.json` există:
```json
"proxy": "http://localhost:5000"
```

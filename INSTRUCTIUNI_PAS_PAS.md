# INSTRUCȚIUNI PAS CU PAS - Acces Public Internet

## 📧 PASUL 1: Configurare Email Gmail

### 1.1 Activează 2-Factor Authentication pe contul Gmail
1. Mergi la https://myaccount.google.com/security
2. Click pe "2-Step Verification"
3. Activează 2FA

### 1.2 Generează App Password
1. Mergi la https://myaccount.google.com/apppasswords
2. Selectează:
   - App: "Mail"
   - Device: "Other (Custom name)"
3. Dă-i numele: "CRT Cinema"
4. Click pe "Generate"
5. **COPIEAZĂ parola generată** (arată ceva de genul: `abcd efgh ijkl mnop`)

### 1.3 Creează fișier `.env` în rădăcina proiectului
1. Deschide folderul proiectului: `c:\Users\User\OneDrive\Desktop\Folder nou (5)`
2. Creează un fișier nou numit `.env` (punct înainte de env)
3. Adaugă linia:
```
EMAIL_PASSWORD=parola-generata-de-tine
```
4. Salvează fișierul

**Important**: Nu commit acest fișier pe GitHub dacă faci deploy!

---

## 🚀 PASUL 2: Instalare ngrok

### 2.1 Descarcă ngrok
1. Mergi la https://ngrok.com/download
2. Descarcă versiunea pentru Windows
3. Dezarhivează fișierul descărcat
4. Copiază `ngrok.exe` într-un folder ușor de accesat (ex: `C:\ngrok`)

### 2.2 Înregistrează-te pe ngrok
1. Mergi la https://ngrok.com/signup
2. Înregistrează-te cu email-ul tău (gratuit)
3. După înregistrare, vei vedea un "Authtoken" în dashboard

### 2.3 Autentifică ngrok
1. Deschide PowerShell sau Command Prompt
2. Navighează în folderul ngrok:
```bash
cd C:\ngrok
```
3. Autentifică-te (înlocuiește cu token-ul tău):
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

---

## 🌐 PASUL 3: Pornește Serverele

### 3.1 Pornește Backend Server
1. Deschide un terminal (PowerShell)
2. Navighează în folderul proiectului:
```bash
cd "c:\Users\User\OneDrive\Desktop\Folder nou (5)"
```
3. Pornește serverul:
```bash
node server/index.js
```
4. Vei vedea: `Server running on http://0.0.0.0:5000`
5. **LASĂ ACEST TERMINAL DESCHIS**

### 3.2 Pornește Frontend React
1. Deschide un ALT terminal (PowerShell)
2. Navighează în folderul client:
```bash
cd "c:\Users\User\OneDrive\Desktop\Folder nou (5)\client"
```
3. Pornește React:
```bash
npm start
```
4. Vei vedea browserul deschizându-se la http://localhost:3000
5. **LASĂ ȘI ACEST TERMINAL DESCHIS**

---

## 📡 PASUL 4: Pornește ngrok pentru Backend

### 4.1 ngrok pentru Backend (port 5000)
1. Deschide un AL TREILEA terminal (PowerShell)
2. Navighează în folderul ngrok:
```bash
cd C:\ngrok
```
3. Pornește ngrok pentru backend:
```bash
ngrok http 5000
```
4. Vei vedea ceva de genul:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```
5. **COPIEAZĂ URL-ul ngrok** (ex: `https://abc123.ngrok-free.app`)
6. **LASĂ ACEST TERMINAL DESCHIS**

### 4.2 Actualizează client/package.json
1. Deschide fișierul: `c:\Users\User\OneDrive\Desktop\Folder nou (5)\client\package.json`
2. Găsește linia: `"proxy": "http://localhost:5000"`
3. Înlocuiește cu URL-ul ngrok:
```json
"proxy": "https://abc123.ngrok-free.app"
```
4. Salvează fișierul
5. **React se va reîncărca automat**

### 4.3 ngrok pentru Frontend (port 3000) - OPȚIONAL
Dacă vrei ca și frontend-ul să fie accesibil public:

1. Deschide un AL PATRULEA terminal (PowerShell)
2. Navighează în folderul ngrok:
```bash
cd C:\ngrok
```
3. Pornește ngrok pentru frontend:
```bash
ngrok http 3000
```
4. Vei vedea un alt URL ngrok
5. **COPIEAZĂ și acest URL**

---

## ✅ PASUL 5: Testare

### 5.1 Testare Email
1. Accesează http://localhost:3000
2. Click pe "Rezervă Bilet" pentru un film
3. Completează formularul cu datele tale
4. Verifică inbox-ul email-ului tău
5. **Ar trebui să primești un email cu:**
   - Codul QR ca atașament (imagine PNG)
   - Codul QR ca text în email
   - Toate detaliile filmului

### 5.2 Testare Acces Public
1. Dă URL-ul frontend ngrok cuiva (ex: prieten)
2. Să acceseze site-ul de pe telefonul lor
3. Să încerce să facă o rezervare
4. Verifică dacă primesc email cu QR code

---

## 📋 Rezumat URL-uri

### Local (doar pe calculatorul tău):
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Public (prin ngrok - accesibil tuturor):
- Backend: https://abc123.ngrok-free.app (URL-ul din terminalul ngrok)
- Frontend: https://xyz789.ngrok-free.app (URL-ul din al doilea terminal ngrok)

---

## ⚠️ NOTĂ IMPORTANTĂ

### URL-ul ngrok se schimbă la fiecare restart:
- Dacă închizi ngrok și îl repornești, URL-ul se schimbă
- Va trebui să actualizezi `client/package.json` cu noul URL
- Va trebui să dai noul URL tuturor

### Soluție permanentă:
Pentru URL stabil care nu se schimbă, folosește:
- **Render** (backend): https://render.com - gratuit
- **Vercel** (frontend): https://vercel.com - gratuit

Instrucțiuni pentru deploy permanent sunt în fișierul `PUBLIC_INTERNET_ACCESS.md`

---

## 🔧 Troubleshooting

### Email nu se trimite:
1. Verifică dacă ai creat fișierul `.env`
2. Verifică dacă parola App Password este corectă
3. Verifică dacă serverul backend rulează
4. Verifică console-ul terminalului backend pentru erori

### ngrok nu pornește:
1. Verifică dacă te-ai autentificat corect
2. Verifică dacă portul 5000 este liber (nu alt proces îl folosește)
3. Verifică dacă ai copiat token-ul corect

### Frontend nu se conectează la backend:
1. Verifică dacă ai actualizat `client/package.json` cu URL-ul ngrok
2. Verifică dacă ngrok pentru backend rulează
3. Verifică dacă backend server rulează
4. Reîncarcă pagina frontend (Ctrl+F5)

### QR code nu apare în email:
1. Verifică dacă folderul `qrcodes` există
2. Verifică permisiunile de scriere în folder
3. Verifică console-ul pentru erori la generare QR

---

## 📝 Checklist Înainte de a Distribui URL-ul:

- [ ] Server backend rulează (terminal 1)
- [ ] Frontend React rulează (terminal 2)
- [ ] ngrok backend rulează (terminal 3)
- [ ] ngrok frontend rulează (terminal 4 - opțional)
- [ ] Fișierul `.env` există cu parola App Password
- [ ] `client/package.json` are URL-ul ngrok la proxy
- [ ] Ai testat rezervarea și email-ul
- [ ] QR code apare ca atașament în email
- [ ] Ai dat URL-ul corect persoanelor

---

## 🎯 Gata pentru Distribuire!

Dă URL-ul frontend ngrok tuturor:
- **Dacă ai pornit ngrok pentru frontend**: URL-ul din terminalul 4
- **Dacă nu**: Oamenii pot accesa doar din rețeaua ta locală (192.168.1.14:3000)

**Recomandare**: Pornește ngrok și pentru frontend pentru acces complet public!

# Deploy Permanent - Site Activ 24/7

Pentru ca site-ul să fie activ chiar și când laptopul este stins, trebuie să faci deploy pe servicii cloud.

## 🎯 Soluția Recomandată (GRATUITĂ)

### Backend: Render (https://render.com)
- Gratuit pentru mici proiecte
- Server rulează 24/7
- HTTPS automat
- URL stabil (nu se schimbă)

### Frontend: Vercel (https://vercel.com)
- Gratuit pentru mici proiecte
- CDN global (site-ul încarcă rapid)
- HTTPS automat
- URL stabil

---

## 📋 PASUL 1: Pregătire pentru Deploy

### 1.1 Verifică dacă ai cont GitHub
Dacă nu, creează un cont la https://github.com

### 1.2 Inițializează Git și încarcă pe GitHub

Deschide PowerShell în folderul proiectului:
```bash
cd "c:\Users\User\OneDrive\Desktop\Folder nou (5)"
git init
git add .
git commit -m "Initial commit"
```

Apoi:
1. Mergi pe https://github.com/new
2. Creează un repository nou (nume: crt-cinema)
3. Copiază comenzile de la GitHub
4. Rulează în PowerShell:
```bash
git remote add origin https://github.com/USERNAME/crt-cinema.git
git branch -M main
git push -u origin main
```

Înlocuiește `USERNAME` cu username-ul tău GitHub.

---

## 🚀 PASUL 2: Deploy Backend pe Render

### 2.1 Creează cont Render
1. Mergi la https://render.com
2. Click "Sign Up"
3. Autentifică-te cu GitHub (recomandat)

### 2.2 Adaugă Environment Variable
1. În Render, mergi la dashboard
2. Click pe "New" → "Web Service"
3. Conectează repository-ul GitHub crt-cinema
4. Configurează:
   - **Name**: crt-cinema-backend
   - **Region**: Frankfurt (sau cel mai apropiat)
   - **Branch**: main
   - **Root Directory**: (lăsa gol)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: Free

5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   - `PORT`: `5000`
   - `HOST`: `0.0.0.0`
   - `EMAIL_PASSWORD`: `sittar-5mujfi-Qagcej` (parola ta App Password)

6. Click "Create Web Service"

7. Așteaptă deploy-ul (durează 5-10 minute)

8. Copiază URL-ul backend (ex: `https://crt-cinema-backend.onrender.com`)

---

## 🎨 PASUL 3: Deploy Frontend pe Vercel

### 3.1 Creează cont Vercel
1. Mergi la https://vercel.com
2. Click "Sign Up"
3. Autentifică-te cu GitHub

### 3.2 Actualizează client/package.json
Înainte de deploy, actualizează proxy-ul cu URL-ul Render:

Deschide `client/package.json` și schimbă:
```json
"proxy": "https://URL-RENDER.onrender.com"
```

Înlocuiește cu URL-ul backend de pe Render.

### 3.3 Deploy pe Vercel
1. În Vercel, click "Add New" → "Project"
2. Selectează repository-ul crt-cinema
3. Configurează:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Click "Deploy"

5. Așteaptă deploy-ul (durează 2-3 minute)

6. Copiază URL-ul frontend (ex: `https://crt-cinema.vercel.app`)

---

## ✅ PASUL 4: Testare

### 4.1 Testează Backend
Accesează URL-ul Render:
- `https://crt-cinema-backend.onrender.com/api/movies`

Ar trebui să vezi lista de filme în format JSON.

### 4.2 Testează Frontend
Accesează URL-ul Vercel:
- `https://crt-cinema.vercel.app`

Site-ul ar trebui să încarce corect.

### 4.3 Testează Email
1. Fă o rezervare pe site
2. Verifică inbox-ul email-ului
3. Ar trebui să primești email cu QR code atașat

---

## 🎉 GATA!

Acum site-ul tău este:
- ✅ Activ 24/7 (chiar și când laptopul e stins)
- ✅ Accesibil de oriunde din lume
- ✅ Cu URL stabil (nu se schimbă)
- ✅ Cu HTTPS automat
- ✅ GRATUIT

---

## 📝 URL-uri Finale

- **Backend**: `https://crt-cinema-backend.onrender.com`
- **Frontend**: `https://crt-cinema.vercel.app`

Dă URL-ul frontend tuturor!

---

## 🔧 Troubleshooting

### Deploy-ul Render eșuează:
1. Verifică dacă ai adăugat toate environment variables
2. Verifică dacă build command este `npm install`
3. Verifică dacă start command este `node server/index.js`
4. Vezi logs în Render dashboard

### Deploy-ul Vercel eșuează:
1. Verifică dacă root directory este `client`
2. Verifică dacă framework preset este Create React App
3. Verifică dacă proxy în client/package.json este corect

### Email nu merge pe Render:
1. Verifică dacă EMAIL_PASSWORD este setat corect
2. Verifică logs în Render pentru erori nodemailer
3. Asigură-te că App Password este valid

### Frontend nu se conectează la backend:
1. Verifică proxy în client/package.json
2. Verifică dacă backend URL este corect
3. Verifică CORS în server/index.js (deja configurat)

---

## 💡 Notă Importantă

### Limitări Plan Gratuit Render:
- Serverul se "doarme" după 15 minute de inactivitate
- Se trezește în ~30 secunde când cineva accesează site-ul
- Pentru activitate continuă, ai nevoie de plan plătit (~$7/lună)

### Limitări Plan Gratuit Vercel:
- Fără limitări majore pentru mici proiecte
- CDN global inclus
- Perfect pentru frontend

### Alternativă pentru Backend (mai stabil):
Dacă vrei backend care nu doarme niciodată:
- **Railway**: https://railway.app ($5/lună pentru planul de bază)
- **Fly.io**: https://fly.io (gratuit pentru mici proiecte)
- **Heroku**: Nu mai este gratuit

---

## 📞 Suport

Dacă ai probleme:
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- GitHub docs: https://docs.github.com

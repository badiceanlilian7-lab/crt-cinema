# Acces Public Internet - Toate Rețelele

Pentru a face site-ul accesibil tuturor persoanelor de pe internet (nu doar din rețeaua locală), ai 2 opțiuni principale:

## Opțiunea 1: ngrok (Rapid și Temporar) - Recomandat pentru testare

ngrok creează un tunnel securizat care expune serverul tău local pe internet printr-un URL public.

### Instalare ngrok:

1. **Descarcă ngrok**: https://ngrok.com/download
2. **Înregistrează-te gratuit**: https://ngrok.com/signup
3. **Autentifică-te** (în terminal):
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Folosire ngrok:

#### Pentru Backend (port 5000):
```bash
ngrok http 5000
```

#### Pentru Frontend (port 3000):
```bash
ngrok http 3000
```

ngrok îți va da un URL public de genul:
- `https://random-name.ngrok-free.app`

Acest URL poate fi accesat de oricine de pe internet!

### Configurare React pentru ngrok:

Trebuie să actualizezi `client/package.json` să folosească URL-ul ngrok în loc de localhost:

```json
"proxy": "https://random-name.ngrok-free.app"
```

Sau poți seta URL-ul API direct în codul React.

---

## Opțiunea 2: Deploy Permanent (Recomandat pentru producție)

Pentru acces permanent, trebuie să faci deploy pe un server public.

### Opțiuni de Hosting:

#### 1. VPS ieftin (DigitalOcean, Linode, Hetzner)
- **Preț**: ~$4-6/lună
- **Control complet**: Ai acces la server
- **Configurare manuală**: Trebuie să configurezi totul

#### 2. Platforme PaaS (Render, Railway, Vercel + backend separat)
- **Render**: https://render.com (gratuit pentru mici proiecte)
- **Railway**: https://railway.app (gratuit pentru mici proiecte)
- **Vercel**: pentru frontend doar (gratuit)
- **Heroku**: nu mai este gratuit

#### 3. Cloud providers (AWS, Google Cloud, Azure)
- **Preț**: variabil, poate fi scump
- **Scalabil**: pentru proiecte mari
- **Complex**: necesită cunoștințe avansate

---

## Deploy Rapid pe Render (Gratuit)

### Pasul 1: Pregătire pentru Deploy

#### 1.1 Adaugă fișier `.env` în rădăcina proiectului:
```env
PORT=5000
HOST=0.0.0.0
EMAIL_PASSWORD=parola-gmail-app
```

#### 1.2 Actualizează `server/index.js` pentru producție:
Serverul este deja configurat corect cu `HOST=0.0.0.0`.

#### 1.2 Adaugă `start` script în `package.json` principal:
```json
"scripts": {
  "start": "node server/index.js"
}
```

### Pasul 2: Deploy Backend pe Render

1. **Creează cont pe Render**: https://render.com
2. **Fă push la cod pe GitHub** (trebuie să ai proiectul pe GitHub)
3. **În Render, click "New +" → "Web Service"**
4. **Conectează repository-ul GitHub**
5. **Configurează**:
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Environment Variables**: adaugă `EMAIL_PASSWORD`
6. **Deploy**

Render îți va da un URL public de genul:
- `https://crt-cinema.onrender.com`

### Pasul 3: Deploy Frontend pe Vercel (Gratuit)

1. **Creează cont pe Vercel**: https://vercel.com
2. **Instalează Vercel CLI**:
```bash
npm install -g vercel
```

3. **Actualizează `client/package.json`**:
```json
"proxy": "https://crt-cinema.onrender.com"
```

4. **Deploy din folderul client**:
```bash
cd client
vercel
```

5. **Urmărește instrucțiunile din terminal**

Vercel îți va da un URL public de genul:
- `https://crt-cinema.vercel.app`

---

## Deploy Rapid pe Railway (Totul într-un singur loc)

Railway poate găzdui atât backend cât și frontend.

### Pasul 1: Pregătire

1. **Creează cont pe Railway**: https://railway.app
2. **Instalează Railway CLI**:
```bash
npm install -g railway
```

### Pasul 2: Deploy

1. **Login**:
```bash
railway login
```

2. **Initializează proiectul**:
```bash
railway init
```

3. **Adaugă backend**:
```bash
railway add
# Selectează "Empty Service" și configurează pentru Node.js
```

4. **Adaugă variabile de mediu**:
```bash
railway variables set PORT=5000
railway variables set EMAIL_PASSWORD=parola-gmail-app
```

5. **Deploy**:
```bash
railway up
```

---

## Soluția cea mai simplă pentru tine acum:

### Folosește ngrok pentru acces imediat:

1. **Instalează ngrok**: https://ngrok.com/download
2. **Autentifică-te** cu token-ul de pe site
3. **Pornește ngrok pentru backend**:
```bash
ngrok http 5000
```

4. **Copiază URL-ul ngrok** (ex: `https://abc123.ngrok-free.app`)

5. **Actualizează `client/package.json`**:
```json
"proxy": "https://abc123.ngrok-free.app"
```

6. **Pornește ngrok pentru frontend** (în alt terminal):
```bash
ngrok http 3000
```

7. **Dă URL-ul frontend ngrok tuturor**

**Avantaje ngrok**:
- ✅ Funcționează imediat
- ✅ Gratuit
- ✅ HTTPS automat
- ✅ Fără configurare complexă

**Dezavantaje ngrok**:
- ❌ URL se schimbă la fiecare restart
- ❌ Nu este pentru producție pe termen lung
- ❌ Limitări de trafic pe planul gratuit

---

## Recomandare Finală:

### Pentru testare rapidă (acum):
Folosește **ngrok** - ai acces public în 5 minute.

### Pentru producție permanentă:
Folosește **Render (backend) + Vercel (frontend)** - ambele gratuite pentru mici proiecte, URL-uri stabile, HTTPS automat.

---

## Notă Importantă despre Email:

Pentru deploy pe internet, trebuie să:
1. Folosești parola App Password de Gmail (nu parola normală)
2. Sau folosești un serviciu de email dedicat (SendGrid, Mailgun)

---

## Securitate Adițională pentru Deploy Public:

1. **Rate limiting**: Limitează cererile pentru a preveni abuzuri
2. **CORS strict**: Configurează CORS doar pentru domeniile tale
3. **Validare input**: Validează toate datele de la utilizatori
4. **HTTPS**: Folosește mereu HTTPS (ngrok, Render, Vercel au automat)
5. **Environment variables**: Nu commit parole în cod

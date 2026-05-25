# Silt & Stem — Indoor Plant Shop

Single-page indoor plant shop with WhatsApp ordering, flashcard plant catalog, and a localStorage cart. Runs locally with Docker or deploys directly to Netlify / Vercel.

---

## Local Setup with Docker

### 1. Install Docker

Download and install Docker Desktop from https://www.docker.com/products/docker-desktop and start it.

### 2. Run the site

```bash
docker compose up
```

Open http://localhost:8080 in your browser.

### 3. Stop the site

```bash
docker compose down
```

### Change the default port

Edit `docker-compose.yml` and change `"8080:80"` to your preferred port, for example `"3000:80"`, then restart:

```bash
docker compose down && docker compose up
```

---

## Updating Content

### Update plants (names, prices, descriptions, stock)

Open `plants.json` and edit the values. Changes reflect immediately — no rebuild needed when using the volume mount in Docker.

Fields per plant:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug, no spaces |
| `name` | string | Display name |
| `description` | string | Short 1-sentence description |
| `price` | number | Price in rupees |
| `image` | string | Path to image file |
| `in_stock` | boolean | `true` or `false` |

### Update plant images

Place new `.webp` image files in the `Images/` folder and update the `image` path in `plants.json` to match.

For best performance keep each image under 200 KB. To convert a PNG or JPG to WebP:

```bash
cwebp -q 80 input.jpg -o output.webp
```

### Change the WhatsApp number

Open `js/cart.js` and update the `WA_NUMBER` constant at the top of the file:

```js
const WA_NUMBER = '91XXXXXXXXXX';
```

Use your country code followed by the number, no spaces or dashes.

### Replace the mini character image

Replace `Images/Mini Creature.png` with your new file keeping the same filename, or update the `src` attributes in `index.html` to point to your new filename. The character appears in the hero and the about section.

### Replace the logo

Replace `Images/Brand_Logo.png` with your logo file keeping the same filename, or update the `src` attribute inside `.brand-logo` in `index.html`.

---

## Deploying to Netlify or Vercel

No build step needed — the site is plain HTML, CSS, and JS.

**Netlify:** Drag and drop the project folder onto https://app.netlify.com/drop, or connect your Git repository and set the publish directory to `/` (root).

**Vercel:** Install the Vercel CLI, then run:

```bash
vercel
```

Set the output directory to `.` (current directory) when prompted.

Docker is not needed for production deployment. Both Netlify and Vercel serve the static files directly.

---

## Folder Structure

```
project-root/
├── index.html
├── plants.json
├── css/
│   └── styles.css
├── js/
│   ├── script.js
│   └── cart.js
├── Images/
│   ├── Brand_Logo.png
│   ├── Mini Creature.png
│   ├── Snake Plant.webp
│   └── ... (other plant images)
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── sitemap.xml
├── robots.txt
└── README.md
```

---

## How Ordering Works

All orders go through WhatsApp only — no payment gateway, no backend.

- **Buy Now** button on each plant card opens WhatsApp with a pre-filled single-item message.
- **Add to Cart** adds the plant to a browser cart stored in `localStorage`.
- **Send Order on WhatsApp** in the cart panel opens WhatsApp with a combined order message listing all items and the total.
- On desktop where WhatsApp may not be installed, a modal appears with the phone number and a Copy Number button.
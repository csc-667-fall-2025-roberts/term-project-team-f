# 🎤 5-Minute Presentation Script: Bullshit Card Game

## Pre-Presentation Checklist ✅
- [ ] Run `npm run migrate:up` (database ready)
- [ ] Start server (`npm run dev`)
- [ ] Have browser open at `http://localhost:3000`
- [ ] Have VS Code open with `src/frontend/styles/` folder visible
- [ ] Clear any existing test users if needed
- [ ] Test signup/login flow beforehand

---

## ⏱️ PART 1: Your Styling Choice (~30 seconds)

> **[SLIDE/SAY THIS]**

"Hi everyone! Today I'm presenting our **Bullshit Card Game** web application.

For styling, we chose **Vanilla CSS** with a **CSS Custom Properties** design system.

**Why we chose this approach:**
- We wanted full control over our design without framework constraints
- CSS variables let us create a consistent **Minimal Black & White** theme throughout the app
- It forced us to really understand CSS deeply rather than relying on utility classes
- The result is a clean, modern aesthetic that matches the sophistication of a card game"

---

## ⏱️ PART 2: Live Application Demo (~3 minutes)

### 2a. Landing Page (10 seconds)
> **[SHOW BROWSER at localhost:3000]**

"Here's our **landing page**. Notice the animated playing cards, the clean black background, and the prominent call-to-action buttons. The emoji icons add personality while keeping the design minimal."

---

### 2b. Signup - Creating a User Account (30 seconds)
> **[CLICK "Create an Account"]**

"Let's create a new user to demonstrate our database connection."

> **[FILL OUT FORM]**
- Username: `demo_player`
- Email: `demo@test.com`
- Password: `password123`

> **[CLICK "Create Account"]**

"When I submit this form, it:
1. Sends a POST request to our `/auth/signup` endpoint
2. Hashes the password with bcrypt
3. **Stores the user in our PostgreSQL database**
4. Creates a session and redirects us to the lobby"

---

### 2c. Lobby Page (30 seconds)
> **[NOW ON LOBBY PAGE]**

"We're now in the **lobby**. Notice:
- The **header** shows our logged-in username
- The **Create Game** form on the left
- The **Available Games** list that pulls from the database
- The **Chat sidebar** on the right

Everything on this page is styled consistently with our dark theme."

---

### 2d. Creating a Game - Database Demo (30 seconds)
> **[FILL OUT CREATE GAME FORM]**
- Game Name: `Demo Game`
- Players: `4`

> **[CLICK "Create Game"]**

"Watch the games list—when I create this game, it:
1. Inserts a new row into our `games` table
2. Adds me as a player in `game_players` table
3. The page refreshes showing the new game from the database

There it is! You can see the game name, player count, and my username as the creator—all pulled from the database."

---

### 2e. Game Page (30 seconds)
> **[CLICK "View" on the game]**

"This is our **game room**. Key features:
- **Game info bar** at top with status badge
- **Waiting room** showing player avatars and empty slots
- **Players sidebar** showing who's joined
- **Chat area** for in-game communication

The waiting room dynamically shows filled slots vs empty dashed-border placeholders."

---

### 2f. Demonstrating Game List Updates (20 seconds)
> **[GO BACK TO LOBBY]**

"Back in the lobby, if I refresh, you'll see our game is still here because it's persisted in the database. If other players were online, they'd see this game and could join it."

---

### 2g. Quick Error Page Demo (10 seconds)
> **[TYPE a non-existent URL like localhost:3000/fakepage]**

"And here's our **error page**—styled consistently with our theme, showing a friendly message and navigation buttons back to home or lobby."

---

### 2h. Logout Demo (10 seconds)
> **[CLICK LOGOUT]**

"And logging out destroys our session and brings us back to the landing page. All pages maintain the same visual language."

---

## ⏱️ PART 3: Quick Code Look (~1 minute)

> **[SWITCH TO VS CODE]**

### 3a. Show CSS Structure (20 seconds)
> **[OPEN src/frontend/styles/ folder in sidebar]**

"Here's our CSS architecture. We organized it into:
- `variables.css` - Our design tokens (colors, spacing, fonts)
- `components.css` - Reusable components (buttons, cards, badges)
- Page-specific files: `auth.css`, `lobby.css`, `game.css`, `error.css`"

---

### 3b. Highlight Design System (20 seconds)
> **[OPEN variables.css]**

"**What I'm proud of**: Our CSS variables create a complete design system.

Look at our color palette—everything stems from a consistent grayscale:
- `--color-black: #0a0a0a` for the background
- `--color-white: #ffffff` for cards and accents
- `--color-gray-XXX` for all the shades in between

This makes our entire app feel cohesive."

---

### 3c. Show One Cool Component (20 seconds)
> **[OPEN game.css, scroll to playing card styles around line 298]**

"One styling choice I'm really proud of is our **playing card** component:
- Clean white cards with subtle shadows
- **Hover effect** that lifts the card up
- **Selection state** with an outline
- Color-coded suits—red for hearts/diamonds, black for spades/clubs

These small details make the game feel polished."

---

## ⏱️ PART 4: Wrap Up (~30 seconds)

> **[LOOK AT CLASS]**

"**One challenge we faced**: Getting the game table layout to work across different screen sizes. We solved it using CSS Grid with responsive breakpoints—the sidebar stacks below on mobile but sits beside the game on desktop.

**Thank you!** Any questions?"

---

## 🎯 Key Points to Remember

| Timing | Section | What to Show |
|--------|---------|--------------|
| 0:00-0:30 | Styling Choice | Explain Vanilla CSS + Variables approach |
| 0:30-1:00 | Landing + Signup | Create user, show DB connection |
| 1:00-2:00 | Lobby + Create Game | Show game creation in DB |
| 2:00-3:00 | Game Page + Updates | Show game room, list updates |
| 3:00-4:00 | Code Look | Show CSS files, highlight playing cards |
| 4:00-5:00 | Wrap Up | Challenge + solution, thank audience |

---

## 💡 Backup Talking Points

If you finish early or need filler:

- "Our button component has multiple variants—primary, secondary, success, danger, outline, ghost—all using the same base styles with color overrides"
- "We used CSS custom properties so we could easily theme the entire app by changing a few variables"
- "The chat sidebar uses flexbox to keep the input pinned to the bottom while messages scroll"
- "Our forms have consistent styling with focus states and placeholder colors"

---

## 🚨 If Something Goes Wrong

- **Server won't start**: "Let me quickly restart—while that loads, I can show you the code..."
- **Database error**: "The database seems to have an issue—let me show you the code that would normally handle this..."
- **Page looks broken**: "Let me refresh—sometimes the CSS needs a moment to load..."

Good luck! 🎮



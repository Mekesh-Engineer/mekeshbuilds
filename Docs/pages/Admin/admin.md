# Page: Resume Manager

**Route:** `/resume`
**Type:** Admin (Protected)
**Guard Chain:** `AuthGuard` → `AdminGuard` → `AdminLayout` → `ResumeManagerPage`

---

## 1. Page Overview

The Resume Manager is the owner's workspace for handling all aspects of resume output — static PDF uploads, dynamic DOM-based PDF generation from live portfolio data, and (planned) AI-generated role-specific resume variants. It bridges the gap between the Firestore-stored portfolio content and the traditional PDF resume format recruiters expect.

**Primary Roles:**

- Upload and manage static PDF resume files to Firebase Storage
- Generate ATS-friendly PDF exports directly from live Firestore portfolio data
- Preview generated PDFs before sharing
- Manage multiple resume variants (general, role-specific, AI-tailored)
- Provide shareable download links for each resume variant

---

## 2. UI Description

### 2.1 Layout

```
┌──────────────────────────────────────────────────────────┐
│  AdminLayout Navbar                                      │
├────────────┬─────────────────────────────────────────────┤
│  Sidebar   │  Resume Manager Header                      │
│            │  "Resume Manager" + "Generate New" button   │
│            │  ─────────────────────────────────────────  │
│            │  ┌─────────────────────┬───────────────────┐│
│            │  │  Resume Library     │  PDF Preview Pane  ││
│            │  │  (left, 380px)      │  (right, flex-1)  ││
│            │  │                     │                   ││
│            │  │  Static PDFs        │  Embedded PDF     ││
│            │  │  ─────────────────  │  viewer or        ││
│            │  │  [Card] General.pdf │  generated        ││
│            │  │  [Card] Frontend.pdf│  preview          ││
│            │  │                     │                   ││
│            │  │  Generated Variants │                   ││
│            │  │  ─────────────────  │                   ││
│            │  │  [Card] Auto-gen    │                   ││
│            │  │  [Card] AI variant  │                   ││
│            │  │                     │                   ││
│            │  │  + Upload PDF       │                   ││
│            │  │  + Generate New     │                   ││
│            │  └─────────────────────┴───────────────────┘│
└────────────┴─────────────────────────────────────────────┘
```

### 2.2 Resume Library (Left Panel)

**Static PDF Cards:**
Each uploaded PDF file is displayed as a card containing:

- File name (editable inline)
- Upload date
- File size
- Label badge (e.g., "General", "Frontend", "Internship")
- Preview icon → loads PDF in the right pane
- Copy link icon → copies Firebase Storage download URL
- Delete icon → `sweetalert2` confirmation → `deleteObject(storageRef)`

**Generated/Dynamic Resume Cards:**
Cards for PDF exports generated from live Firestore data:

- "Generated from portfolio data" label
- Generation timestamp
- Preview + Download buttons
- Re-generate button (re-runs `useExportPDF` hook)

**AI Variant Cards [PLANNED]:**

- "AI-generated for [Role]" label
- Generated timestamp
- Status badge (generating / ready / failed)
- Placeholder state until `aiService.ts` is implemented

### 2.3 Upload Zone

- Full-width drag-and-drop zone with dashed border
- "Drag & drop PDF here or click to select"
- File type validation: `.pdf` only
- File size limit: 10MB
- On upload: Firebase Storage → success → adds to library list via query invalidation

### 2.4 PDF Preview Pane (Right Panel)

- Static PDFs: rendered using browser's native `<object type="application/pdf">` or an `<iframe>` pointing to the Firebase Storage URL
- Generated PDFs: HTML-to-canvas preview rendered inline
- Full-screen expand button
- Download button at the top of the preview pane
- "Share Link" button copies the public download URL

### 2.5 Generate New Resume Modal

A `sweetalert2` modal or slide-in drawer with options:

- Template selector: "Minimal ATS" | "Modern Two-Column" | "Technical Compact"
- Sections to include: checkboxes for Personal Info, Skills, Experience, Projects, Certificates, Education
- Custom header override: optional custom name/tagline for the generated PDF
- "Generate PDF" button → triggers `useExportPDF` hook

---

## 3. Features & Functionality

### 3.1 Static PDF Upload

```ts
// src/services/storageService.ts
async function uploadResumePdf(file: File, label: string): Promise<string> {
  const path = `owner/resumes/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  // Save metadata to Firestore
  await setDoc(doc(db, 'resume_files', generateId()), {
    ownerId: currentUser.uid,
    fileName: file.name,
    label,
    url,
    storagePath: path,
    uploadedAt: serverTimestamp(),
    type: 'static',
  });
  return url;
}
```

### 3.2 Dynamic PDF Generation (useExportPDF)

```ts
// src/hooks/useExportPDF.ts
export function useExportPDF() {
  const exportPDF = async (targetElementId: string, filename: string) => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      toast.error('Resume preview element not found');
      return;
    }
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  };
  return { exportPDF };
}
```

The resume template component (`ResumeTemplate`) is a hidden DOM element rendered off-screen, populated with live Firestore data, and targeted by `useExportPDF`.

### 3.3 Copy Share Link

```ts
async function copyDownloadLink(url: string) {
  await navigator.clipboard.writeText(url);
  toast.success('Download link copied!');
}
```

### 3.4 Delete Resume File

```ts
async function deleteResume(storagePath: string, docId: string) {
  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, 'resume_files', docId));
  queryClient.invalidateQueries({ queryKey: ['resumeFiles', ownerId] });
}
```

### 3.5 Resume Templates

Three built-in HTML/CSS resume templates are defined in `src/components/ResumeTemplates/`:

- `MinimalATS.tsx` — clean single-column, maximum ATS parseability
- `ModernTwoColumn.tsx` — branded left sidebar + content column
- `TechnicalCompact.tsx` — dense layout optimized for technical roles

All templates consume the same `ResumeData` type, populated from Firestore portfolio data.

---

## 4. Styling

### 4.1 Resume Cards

- Same `BentoBlock` base as other admin pages
- Active/selected card: left border in `--color-primary`, background slightly lighter
- Card label badge: pill shape, colored by category (general = blue, role-specific = orange, AI = purple)

### 4.2 Upload Zone

```css
.upload-zone {
  border: 2px dashed var(--sys-border);
  border-radius: var(--bento-radius);
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s;
}
.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.05);
}
```

### 4.3 PDF Preview Pane

- Background: `#ffffff` (white, mimics paper)
- Shadow: `0 4px 32px rgba(0,0,0,0.4)` (elevated document feel)
- Rounded corners: `8px`
- Toolbar above preview: dark glass bar with action buttons

### 4.4 Responsiveness

- On `< 768px`: left/right panels stack vertically
- Library panel collapses to a horizontal scroll of card chips
- Preview pane is full-width below the library chips

---

## 5. Connections

### 5.1 React Query

```ts
const { data: resumeFiles } = useQuery({
  queryKey: ['resumeFiles', ownerId],
  queryFn: () => storageService.fetchResumeFiles(ownerId),
});
const { data: portfolioData } = usePortfolioData(ownerUsername);
```

### 5.2 Services Called

- `storageService.uploadResumePdf(file, label)`
- `storageService.fetchResumeFiles(ownerId)` — reads `resume_files` Firestore collection
- `storageService.deleteResume(storagePath, docId)`
- `useExportPDF()` hook for generation

---

## 6. Firebase Setup & Integration

### 6.1 Firebase Storage

- **Bucket path:** `owner/resumes/` (write-protected to owner)
- **Public read:** Firebase Storage rules allow public `get` on `owner/resumes/**` so download URLs work for recruiters
- **CORS:** Configure CORS on the Storage bucket to allow `html2canvas` to load image assets during PDF generation

```json
// cors.json for Firebase Storage
[
  {
    "origin": ["https://your-domain.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

### 6.2 Firestore — `resume_files` Collection

```ts
interface ResumeFile {
  id: string;
  ownerId: string;
  fileName: string;
  label: string; // "General" | "Frontend" | custom
  url: string; // Firebase Storage download URL
  storagePath: string; // For deletion
  uploadedAt: Timestamp;
  type: 'static' | 'generated' | 'ai-variant';
  templateUsed?: string; // For generated type
}
```

### 6.3 Security Rules

```
match /resume_files/{fileId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.ownerId;
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
}
// Firebase Storage
match /owner/resumes/{filename} {
  allow read: if true;   // Public download URLs
  allow write: if request.auth != null
    && request.auth.token.email == "owner@example.com";
}
```

---

## 7. Additional Notes

- **`html2canvas` + `jsPDF`** are in `package.json`. CORS configuration on the Storage bucket is required for `html2canvas` to capture images from Firebase Storage URLs.
- **ATS Optimization:** The `MinimalATS` template intentionally avoids complex CSS (no flexbox/grid, no background colors) to ensure the PDF parses correctly through Applicant Tracking Systems.
- **AI Variant Generation** is the planned Phase 2 feature where a Cloud Function runs a Genkit prompt to generate a role-tailored resume variant based on a provided job description.
- **Resume File Limit:** Consider capping at 10 resume files per owner to manage storage costs (Firebase Storage free tier is 5GB).

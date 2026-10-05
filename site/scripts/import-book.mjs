// ============================================================
// import-book.mjs —— 把手稿导入为 nimbus 站点页面
// 用法：node scripts/import-book.mjs   （site/ 目录下，默认导入中文 C# 版到 book/）
// 双版本：BOOK_SRC=/tmp/manuscript-java BOOK_DEST=book-java node scripts/import-book.mjs
// 由 `prebuild` 自动调用，保证构建永远用最新书稿
// 输出 82 页：前言 1 + 11 章 × 8（导读 + 5 节 + 本章要点 + 战争故事）+ 落地页 1
// ============================================================
import { readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// 双版本：BOOK_SRC 指定手稿目录（默认 ../manuscript，即中文 C# 版），
// BOOK_DEST 指定站点输出子目录（默认 book；Java 版用 book-java）
const MANUSCRIPT_DIR = process.env.BOOK_SRC || join(ROOT, '..', 'manuscript');
const BOOK_DEST = process.env.BOOK_DEST || 'book';
// 侧边栏分组前缀，让 C# / Java 两版在导航里一眼区分
const VERSION_LABEL = BOOK_DEST === 'book-java' ? 'Java 版' : 'C# 版';
const IMAGES_DIR = join(ROOT, '..', 'images');
const PUBLIC_IMAGES_DIR = join(ROOT, 'public', 'images');
const OUT_DIR = join(ROOT, 'src', 'content', 'docs', BOOK_DEST);

// 站点 base 路径（astro.config.ts 里的 base: "..."），图片引用要带上它，
// 否则部署到 GitHub Pages 项目路径下时题图 404
function readBase() {
  const cfg = readFileSync(join(ROOT, 'astro.config.ts'), 'utf8');
  const m = cfg.match(/base:\s*["']([^"']+)["']/);
  let b = m ? m[1] : '/';
  if (!b.endsWith('/')) b += '/';
  return b;
}
const SITE_BASE = readBase();

// 章节插画：images/ch01-abstract.png … ch11-abstract.png 拷到 public/images/
// PlantUML 图：images/puml/*.png 拷到 public/images/puml/
// （public 目录映射到站点根，构建后位于 <base>/images/）
function copyChapterImages() {
  mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  let n = 0;
  for (let i = 1; i <= 11; i++) {
    const name = `ch${String(i).padStart(2, '0')}-abstract.png`;
    const src = join(IMAGES_DIR, name);
    if (existsSync(src)) {
      writeFileSync(join(PUBLIC_IMAGES_DIR, name), readFileSync(src));
      n++;
    }
  }
  // PlantUML 图
  const pumlSrc = join(IMAGES_DIR, 'puml');
  const pumlDst = join(PUBLIC_IMAGES_DIR, 'puml');
  mkdirSync(pumlDst, { recursive: true });
  for (const f of readdirSync(pumlSrc)) {
    if (f.endsWith('.png')) {
      writeFileSync(join(pumlDst, f), readFileSync(join(pumlSrc, f)));
      n++;
    }
  }
  console.log(`import-book: 拷贝图片 ${n} 张`);
}
// 正文里的 ../../images/xxx 改写为 <base>/images/xxx（Astro 不会自动给
// markdown 里的根绝对路径加 base，必须手动带上）
const fixImagePaths = (body) => body.replace(/\.\.\/\.\.\/images\//g, `${SITE_BASE}images/`);

// ---- 极简 YAML 头解析（字段都是单行 key: value，值可能带引号） ----
function parseHead(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { head: {}, body: text };
  const head = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    head[line.slice(0, i).trim()] = v;
  }
  return { head, body: text.slice(m[0].length) };
}

const stripNum = (name) => name.replace(/^\d+-/, '');
const sortKey = (name) => (name === '_index.md' ? '000' : name);

function readBookMeta() {
  const meta = {};
  // 优先用手稿目录里的 book.yaml（装配时已带技术栈后缀），回退到仓库根
  const cand = [join(MANUSCRIPT_DIR, 'book.yaml'), join(ROOT, '..', 'book.yaml')];
  const f = cand.find((p) => existsSync(p));
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return meta;
}

// 正文标题移位：bookwriter 用 `#` 写小节，nimbus 页面标题来自 frontmatter，
// 把一级标题降为二级，避免一页两个 H1
const demoteH1 = (body) => body.replace(/^(#{1}) /gm, '## ');

function frontmatter({ title, description, order, label, group }) {
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '\\"')}"`;
  return [
    '---',
    `title: ${esc(title)}`,
    `description: ${esc(description)}`,
    'sidebar:',
    `  order: ${order}`,
    `  label: ${esc(label || title)}`,
    '  group:',
    `    label: ${esc(group)}`,
    '---',
    '',
  ].join('\n');
}

function main() {
  const book = readBookMeta();
  copyChapterImages();
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const groups = readdirSync(MANUSCRIPT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let order = 0;
  let pages = 0;
  const chapters = []; // 给落地页的章节索引 [{slug, title}]

  const write = (relPath, fm, body) => {
    const full = join(OUT_DIR, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, fm + demoteH1(fixImagePaths(body)).replace(/\s+$/, '') + '\n');
    pages++;
  };

  for (const g of groups) {
    const gslug = stripNum(g);
    const files = readdirSync(join(MANUSCRIPT_DIR, g))
      .filter((f) => f.endsWith('.md'))
      .sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));

    if (g === '010-front-matter') {
      // 前言组：_index.md（卷首）与 010-preface.md（前言）各成一页
      for (const f of files) {
        const { head, body } = parseHead(readFileSync(join(MANUSCRIPT_DIR, g, f), 'utf8'));
        if (!body.trim()) {
          console.log(`skip 空页面: ${g}/${f}`);
          continue;
        }
        const fslug = f === '_index.md' ? 'foreword' : stripNum(f).replace(/\.md$/, '');
        write(
          `${fslug}.md`,
          frontmatter({ title: head.title, description: head.synopsis, order: order += 10, group: `${VERSION_LABEL} · 开篇` }),
          body,
        );
      }
      continue;
    }

    // 章节组
    const idxFile = files.find((f) => f === '_index.md');
    const { head: chHead } = parseHead(readFileSync(join(MANUSCRIPT_DIR, g, idxFile), 'utf8'));
    const chNum = chapters.length + 1;
    const chSlug = gslug;
    const groupLabel = `${VERSION_LABEL} · 第${chNum}章 · ${chHead.title}`;
    chapters.push({ slug: chSlug, title: chHead.title });

    for (const f of files) {
      const { head, body } = parseHead(readFileSync(join(MANUSCRIPT_DIR, g, f), 'utf8'));
      const fslug = f === '_index.md' ? 'index' : stripNum(f).replace(/\.md$/, '');
      write(
        `${chSlug}/${fslug}.md`,
        frontmatter({
          title: f === '_index.md' ? `${chHead.title} · 本章导读` : head.title,
          description: head.synopsis,
          order: order += 10,
          group: groupLabel,
        }),
        body,
      );
    }
  }

  // 落地页 index.md（order 最小，排最前），带版本互链
  const links = chapters.map((c, i) => `- [第${i + 1}章 · ${c.title}](./${c.slug}/)`).join('\n');
  const otherVer = BOOK_DEST === 'book'
    ? '\n\n> 本书还有另一个技术栈版本：[软件架构（Java版）](../book-java/)，正文相同，代码示例为 Java 21 + Spring Boot 3。\n'
    : '\n\n> 本书还有另一个技术栈版本：[软件架构（C#版）](../book/)，正文相同，代码示例为 C# / .NET 8+。\n';
  write(
    'index.md',
    frontmatter({
      title: book.title || '软件架构',
      description: book.subtitle || '',
      order: -100,
      label: '全书导读',
      group: `${VERSION_LABEL} · 开篇`,
    }),
    `${book.subtitle || ''}${otherVer}\n## 章节\n\n${links}\n\n[前言](./preface/)\n`,
  );

  console.log(`import-book: [${BOOK_DEST}] 生成 ${pages} 页`);
  // 前言 1 + 11 章 × 8（导读 + 5 节 + 本章要点 + 战争故事）+ 落地页 1 = 82
  if (pages !== 90) {
    console.error(`页数不对：期望 90，实际 ${pages}`);
    process.exit(1);
  }
}

main();

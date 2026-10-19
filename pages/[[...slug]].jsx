import Head from 'next/head';
import Script from 'next/script';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

async function loadPages() {
  return JSON.parse(await readFile(path.join(process.cwd(), '.generated/pages.json'), 'utf8'));
}

export async function getStaticPaths() {
  const pages = await loadPages();
  return { paths: Object.keys(pages).map(route => ({ params: { slug: route === '/' ? [] : route.slice(1).split('/') } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const pages = await loadPages();
  const route = params?.slug?.length ? `/${params.slug.join('/')}` : '/';
  return { props: pages[route] };
}

export default function FoundationPage({ title, description, html, library }) {
  return <>
    <Head><title>{title}</title><meta name="description" content={description} /></Head>
    <div id="site-content" className={library ? 'library-page' : undefined} dangerouslySetInnerHTML={{ __html: html }} />
    <Script id="foundation-controller" type="module" src={library ? '/library.js' : '/app.js'} strategy="afterInteractive" />
  </>;
}

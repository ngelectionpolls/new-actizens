import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props) {
  const page = props.__NEXT_DATA__.props.pageProps;
  return <Html lang="en" suppressHydrationWarning>
    <Head>
      <script src="/theme-init.js" />
      <meta name="theme-color" content="#0b5a35" />
      <link rel="icon" href="/assets/f07f3.png" />
      {['/assets/inter.css', '/assets/league-spartan.css', ...(!page.library ? ['/design.css'] : []), '/site.css', '/experience.css', ...(!page.library ? ['/design-dark.css'] : []), '/theme.css', ...(page.library ? ['/library.css'] : [])].map(href => <link key={href} rel="stylesheet" href={href} />)}
    </Head>
    <body className={page.library ? 'library-page' : undefined} data-page={page.page || undefined} data-library={page.library || undefined} data-article={page.article || undefined}>
      <Main /><NextScript />
    </body>
  </Html>;
}

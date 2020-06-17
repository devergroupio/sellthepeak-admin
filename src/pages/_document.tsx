import Document, { Head, Html, Main, NextScript } from "next/document";
class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <>
            <link
              href="https://cdnjs.cloudflare.com/ajax/libs/antd/4.3.4/antd.dark.min.css"
              rel="stylesheet"
            />
          </>
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

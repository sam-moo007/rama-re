import Link from "next/link";

export default function NotFound() {
  return (
    <main className="notFoundPage">
      <p className="eyebrow">RAMA / 404</p>
      <h1>That decision record is not available.</h1>
      <p>The property may have expired, changed identifier, or not been published.</p>
      <Link className="primaryButton" href="/en/properties/residence-1204">
        Open the sample property
      </Link>
    </main>
  );
}

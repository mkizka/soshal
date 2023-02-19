import { GetServerSideProps } from "next";

const Noop = () => undefined;
export default Noop;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "application/jrd+json");
  res.write(
    JSON.stringify({
      // https://nodeinfo.diaspora.software/protocol.html
      links: [
        {
          rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
          href: `https://${env.HOST}/nodeinfo/2.1`,
        },
      ],
    })
  );
  res.end();
  return { props: {} };
};

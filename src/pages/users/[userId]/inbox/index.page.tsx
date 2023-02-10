import type { GetServerSideProps } from "next";

const Noop = () => undefined;
export default Noop;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  console.log(JSON.stringify(req, null, 2));
  return { notFound: true };
};

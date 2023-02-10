import { handle, notFound } from "next-runtime";

const Noop = () => undefined;
export default Noop;

export const getServerSideProps = handle({
  async post({ req: { headers, body } }) {
    console.log({ headers, body });
    return notFound();
  },
});

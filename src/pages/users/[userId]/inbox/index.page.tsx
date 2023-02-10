import { handle, notFound } from "next-runtime";

const Noop = () => undefined;
export default Noop;

export const getServerSideProps = handle({
  async post({ req }) {
    console.log(req.body);
    return notFound();
  },
});

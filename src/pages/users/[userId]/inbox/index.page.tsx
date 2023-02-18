import { handle, json } from "next-runtime";
import { logger } from "../../../../utils/logger";
import { follow } from "./follow";

const Noop = () => undefined;
export default Noop;

export const getServerSideProps = handle({
  async post({ req }) {
    switch (req.body.type) {
      case "Follow":
        return follow(req.body);
      default:
        logger.warn(`未実装のActivityです: ${req.body.type}`);
        return json({}, 400);
    }
  },
});

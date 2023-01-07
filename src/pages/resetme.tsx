import { signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";

const ResetMe = () => {
  const session = useSession();
  const mutation = api.example.resetMe.useMutation();
  return (
    <button
      onClick={(e) => {
        mutation.mutate();
        signOut().then(() => {
          location.href = "/";
        });
      }}
    >
      {session.data?.user?.name}を削除
    </button>
  );
};

export default ResetMe;

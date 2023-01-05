import { useSession } from "next-auth/react";
import { FormEventHandler, useRef } from "react";
import { api } from "../utils/api";

const ChangeMyName = () => {
  const session = useSession();
  const ref = useRef<HTMLInputElement>(null);
  const mutation = api.example.changeMyName.useMutation();
  const change: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const newName = ref.current?.value || "";
    if (newName.length > 0) {
      mutation.mutate({ name: newName });
    }
  };
  console.log(1);
  return (
    <form onSubmit={change}>
      <p>
        {session.data && `今のあなたの名前は${session.data?.user?.name}です`}
      </p>
      <input ref={ref} />
      <button type="submit">名前を変更</button>
    </form>
  );
};

export default ChangeMyName;

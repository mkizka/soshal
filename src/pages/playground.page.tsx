import { signOut, useSession } from "next-auth/react";
import { useRef } from "react";
import { api } from "../utils/api";

const ChangeMyName = () => {
  const session = useSession();
  const ref = useRef<HTMLInputElement>(null);
  const mutation = api.example.changeMyName.useMutation();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const newName = ref.current?.value || "";
        if (newName.length > 0) {
          mutation.mutate({ name: newName });
          location.reload();
        }
      }}
    >
      <p>
        {session.data && `今のあなたの名前は${session.data?.user?.name}です`}
      </p>
      <input ref={ref} />
      <button type="submit">名前を変更</button>
    </form>
  );
};

const ResetMe = () => {
  const session = useSession();
  const mutation = api.example.resetMe.useMutation();
  return (
    <button
      onClick={() => {
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

const AddNote = () => {
  const context = api.useContext();
  const mutation = api.note.create.useMutation({
    onSuccess() {
      context.example.invalidate();
    },
  });
  const deleteMutation = api.note.delete.useMutation({
    onSuccess() {
      context.example.invalidate();
    },
  });
  const ref = useRef<HTMLInputElement>(null);
  const { data: notes } = api.example.getAllNotes.useQuery();
  const handleClick = () => {
    const { value: text } = ref.current || {};
    if (text) {
      mutation.mutate({ text });
    }
  };
  return (
    <div>
      <input ref={ref} />
      <button onClick={handleClick}>Noteを追加</button>
      {notes &&
        notes.map((note) => (
          <p key={note.id}>
            {note.id}: {note.content}
            <button onClick={() => deleteMutation.mutate(note.id)}>削除</button>
          </p>
        ))}
    </div>
  );
};

const PlayGround = () => {
  return (
    <div>
      <ChangeMyName />
      <ResetMe />
      <AddNote />
    </div>
  );
};
export default PlayGround;

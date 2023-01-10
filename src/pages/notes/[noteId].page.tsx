import type { GetServerSideProps } from "next";
import { prisma } from "../../server/db";
import { activityStreams } from "../../utils/activitypub";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Note = (props: any) => {
  return (
    <pre>
      <code>{props.note}</code>
    </pre>
  );
};

export default Note;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  if (typeof params?.noteId != "string") {
    return { notFound: true };
  }
  const note = await prisma.note.findFirst({ where: { id: params.noteId } });
  if (note == null) {
    return { notFound: true };
  }
  if (req.headers.accept?.includes("application/activity+json")) {
    res.setHeader("Content-Type", "application/activity+json");
    // TODO: hostを環境変数で受け取る
    res.write(JSON.stringify(activityStreams.note(note)));
    res.end();
  }
  return {
    props: {
      note: JSON.stringify(note, null, 2),
    },
  };
};

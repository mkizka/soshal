import { GetServerSideProps } from "next";
import { prisma } from "../../server/db";

const User = (props: any) => {
  return <p>{props.message}</p>;
};

export default User;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  if (!(params && params.username && typeof params.username == "string")) {
    return { notFound: true };
  }
  const user = await prisma.user.findFirst({
    where: {
      name: params.username,
    },
  });
  if (user == null) {
    return { notFound: true };
  }
  if (req.headers.accept?.includes("application/activity+json")) {
    res.setHeader("Content-Type", "application/activity+jsong");
    const baseUrl = `https://${req.headers.host}`;
    const userId = `${baseUrl}/@${user.name}`;
    res.write(
      JSON.stringify({
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1",
        ],
        id: userId,
        type: "Person",
        inbox: `${userId}/inbox`,
        outbox: `${userId}/outbox`,
        following: `${userId}/following`,
        followers: `${userId}/followers`,
        preferredUsername: user.name,
        name: user.name,
        // summary: user.summary,
        url: userId,
        publicKey: {
          id: userId,
          type: "Key",
          owner: userId,
          publicKeyPem: user.publicKey,
        },
        icon: {
          type: "Image",
          mediaType: "image/png",
          // url: user.iconUrl,
        },
        image: {
          type: "Image",
          mediaType: "image/png",
          // url: user.imageUrl,
        },
      })
    );
    res.end();
  }
  return {
    props: { message: `hello ${user.name}` },
  };
};

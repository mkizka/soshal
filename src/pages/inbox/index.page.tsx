const Noop = () => undefined;
export default Noop;
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const userCount = await prisma.user.count();
  // TODO: ローカルだけを対象に集計する
  const noteCount = await prisma.note.count();
  res.setHeader("Content-Type", "application/jrd+json");
  res.write(
    JSON.stringify({
      // https://nodeinfo.diaspora.software/protocol.html
      version: "2.1",
      software: {
        // TODO: 名前決まったら変える
        name: "soshal",
        version: pkg.version,
        repository: "https://github.com/mkizka/soshal.git",
        homepage: "https://github.com/mkizka/soshal",
      },
      protocols: ["activitypub"],
      services: { inbound: [], outbound: [] },
      openRegistrations: true,
      usage: {
        users: {
          total: userCount,
          // misskey.io が null になってたので
          activeHalfyear: null,
          activeMonth: null,
        },
        localPosts: noteCount,
        // 同上
        localComments: 0,
      },
      metadata: {},
    })
  );
  res.end();
  return { props: {} };
};

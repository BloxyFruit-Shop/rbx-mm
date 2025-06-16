const config = {
  providers: [
    {
      domain: `${process.env.BETTER_AUTH_URL}/api/auth`,
      applicationID: "convex",
    },
  ],
};

export default config;

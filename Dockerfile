FROM denoland/deno:1.15.3

# The port that your application listens to.
EXPOSE 8080

WORKDIR /

ADD . .

CMD ["run", "--allow-net", "--unstable", "--allow-read", "--allow-write", "entry.ts"]
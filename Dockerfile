# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR "/Users/Neko/Documents/Studium Kram/3_Semester/mkss2/mkss2_bun"

COPY ./package.json .

# install dependencies from package.json
RUN bun install

# copy files to container
COPY . .

# start server
CMD [ "bun", "run", "devStart"]
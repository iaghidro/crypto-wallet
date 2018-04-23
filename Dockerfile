
FROM iaghidro/wallet-apps:latest

COPY ./ /app
COPY ./wallets/ /wallets

WORKDIR /app

# Run app provisioning script
RUN /app/provision.sh
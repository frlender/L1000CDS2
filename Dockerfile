FROM library/node:0.10

RUN apt-get update && apt-get install -y npm git

WORKDIR /home

EXPOSE 8182

CMD git clone -b product http://readonly:systemsbiology@amp.pharm.mssm.edu/gitlab/apps/L1000CDS2.git \
	&& cd L1000CDS2 \
	&& npm install \
	&& npm install -g grunt-cli \
	&& npm install -g bower \
	&& bower -F install --allow-root \
	&& grunt deploy2

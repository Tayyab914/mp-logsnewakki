FROM fluent/fluentd:v1.11-1

USER root
RUN apk add --no-cache --update \
      sudo build-base ruby-dev \
      && sudo gem install fluent-plugin-elasticsearch -v "<4.0" \
      && sudo gem install faraday-net_http -v 3.0.2

COPY fluent.conf /fluentd/etc/fluent.conf

USER fluent

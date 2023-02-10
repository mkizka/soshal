export const expectedHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noKeyIdHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noAlgorithmHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noHeadersHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noSignatureHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",`,
};

export const invalidDateHeader = {
  date: "Sun, 01 Jan 2024 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const invalidDigestHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=invalid",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const invalidHostHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "invalid.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const invalidSignatureHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) date host digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const unSupportedAlgorithmHeader = {
  date: "Sun, 01 Jan 2023 00:00:00 GMT",
  digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  host: "remote.example.com",
  signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="unsupported",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

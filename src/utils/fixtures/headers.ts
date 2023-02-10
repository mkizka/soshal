export const expectedHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noKeyIdHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noAlgorithmHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noHeadersHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const noSignatureHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",`,
};

export const invalidDateHeader = {
  Date: "Sun, 01 Jan 2024 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const invalidDigestHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=invalid",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const invalidHostHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "invalid.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const invalidSignatureHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="rsa-sha256",` +
    `headers="(request-target) date host digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

export const unSupportedAlgorithmHeader = {
  Date: "Sun, 01 Jan 2023 00:00:00 GMT",
  Digest: "SHA-256=RBNvo1WzZ4oRRq0W9+hknpT7T8If536DEMBg9hyq/4o=",
  Host: "remote.example.com",
  Signature:
    `keyId="https://myhost.example.com/example#main-key",` +
    `algorithm="unsupported",` +
    `headers="(request-target) host date digest",` +
    `signature="CKZWtohqnHXjkIu3SEH20luhWcj6JdyBcPlPVoyeNJhRm9b7gJpIjUpCfCf7KsOR5r56tYHoMF2TG6ixJYOQ5NlCSRTBpOhmFfPL9ly2TS2O1wgm29qn6xFwqd4kTZn2NHxwR5BsMDjFfPD18sbxyhlkCSm8KbIExMJTIL+10FT8pQYgQXGZP6oGKQLQjgAp2SqvTEMrhUKZ5/2yFR5lDKp66RCarePhem78RDFePUh7QZSmlvK25G2IUlKs40KUmot4ZQD3yyEcteMXNJXXJ3PwfBTkqJshMbm/P9mYqOCfkUcmjEIT1qdP286qM/2Ewrac/6UCIQ5j0igGgg=="`,
};

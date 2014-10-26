/**
 * Class represeting a parsed GMail message
 */
GMail.Message = function (doc) {
  _.extend(this, parseDoc(doc));
};

var parseDoc = function (doc) {
  var r = {
    _id: doc.id,
    _threadId: doc.threadId,
    _historyId: doc.historyId,
    snippet: htmlDecode(doc.snippet)
  };

  // parse the commonly used headers
  _.each(['to', 'from', 'cc', 'bcc', 'date', 'subject'], function (field) {
    // header name is the same but capitalized
    var headerName = field.charAt(0).toUpperCase() + field.slice(1);
    var header = _.find(doc.payload.headers, function (h) {
      return h.name === headerName;
    });

    var val = header && header.value || null;

    if (field === 'date' && val)
      val = new Date(val);

    r[field] = val;
  });

  // Parse the body of the message: html and text. Skip the attachments.
  r.html = messageFromPayload(doc.payload, 'text/html');
  r.text = messageFromPayload(doc.payload, 'text/plain');

  return r;
};

var messageFromPayload = function (payload, mimeType) {
  var emailBody = payload.body;
  if (emailBody.size) {
    return decodeBase64(emailBody.data);
  } else if (payload.parts && payload.parts.length) {
    var result = null;
    var parts = payload.parts;
    _.each(parts, function (part) {
      if (part.mimeType !== mimeType)
        return;
      result = decodeBase64(part.body.data);
    });
    return result;
  }
};


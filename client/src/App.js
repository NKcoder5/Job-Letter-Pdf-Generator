import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    date: '',
    recipientName: '',
    recipientAddress: '',
    position: '',
    joiningDate: '',
    salary: '',
    senderName: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [shareableLink, setShareableLink] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/submit', formData);
      setApplicationId(res.data.application._id);
      setSubmitted(true);
      alert('Job offer letter submitted successfully!');
    } catch (error) {
      console.error('Error submitting letter', error);
      alert('Failed to submit letter.');
    }
  };

  const generatePdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('Times', '');
    doc.setFontSize(13);
    let y = 60;
    const left = 60;
    const lineGap = 22;
    const maxWidth = 470;

    // Header
    doc.text(formData.date || '_____________', left, y);
    y += lineGap * 2;
    doc.text('To,', left, y);
    y += lineGap;
    doc.text(formData.recipientName || '________________________', left, y);
    y += lineGap;
    doc.text(formData.recipientAddress || '________________________', left, y);
    y += lineGap * 2;

    // Subject
    doc.setFont(undefined, 'bold');
    doc.text('Subject: Offer of Employment', left, y);
    doc.setFont(undefined, 'normal');
    y += lineGap * 2;

    // Salutation
    doc.text('Dear ' + (formData.recipientName || '___________') + ',', left, y);
    y += lineGap * 2;

    // Body (fixed content with embedded fields)
    const body = `We are pleased to offer you the position of ${formData.position || '__________'} at our company. Your joining date will be ${formData.joiningDate || '__________'}, and your starting annual salary will be ${formData.salary || '__________'}.

Please find below the terms and conditions of your employment:`;
    const bodyLines = doc.splitTextToSize(body, maxWidth);
    doc.text(bodyLines, left, y);
    y += bodyLines.length * lineGap;
    y += lineGap;

    // Terms & Conditions
    doc.setFont(undefined, 'bold');
    doc.text('Terms and Conditions:', left, y);
    doc.setFont(undefined, 'normal');
    y += lineGap;
    const terms = [
      '1. You will be on a probation period of 6 months from your joining date.',
      '2. Your employment is subject to verification of your documents and background.',
      '3. You are required to maintain confidentiality of all company information.',
      "4. Either party may terminate employment with one month's notice.",
      '5. You must adhere to all company policies and code of conduct.',
    ];
    terms.forEach(term => {
      const termLines = doc.splitTextToSize(term, maxWidth);
      doc.text(termLines, left, y);
      y += termLines.length * lineGap;
    });
    y += lineGap;

    // Closing
    doc.text('We look forward to having you on our team.', left, y);
    y += lineGap * 2;
    doc.text('Sincerely,', left, y);
    y += lineGap;
    doc.text(formData.senderName || '________________________', left, y);

    return doc;
  };

  const handleGenerateAndSavePdf = () => {
    const doc = generatePdf();
    doc.save('job-offer-letter.pdf');
  };

  const handleShare = async () => {
    if (!applicationId) {
      alert('Please submit the letter first!');
      return;
    }
    const doc = generatePdf();
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], 'job-offer-letter.pdf', { type: 'application/pdf' });

    const uploadData = new FormData();
    uploadData.append('pdf', pdfFile);
    uploadData.append('applicationId', applicationId);

    try {
      const res = await axios.post('http://localhost:5000/upload-pdf', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShareableLink(res.data.link);
      alert('PDF uploaded successfully!');
    } catch (error) {
      console.error('Error uploading PDF', error);
      alert('Failed to upload PDF.');
    }
  };

  return (
    <div className="App">
      <h1>Job Offer Letter</h1>
      <form className="letter-form" onSubmit={handleSubmit}>
        <div className="letter-block">
          <div className="letter-row">
            <label>Date:</label>
            <input
              className="letter-input"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ height: 18 }} />
          <div className="letter-row">To,</div>
          <div className="letter-row">
            <input
              className="letter-input"
              name="recipientName"
              placeholder="Recipient Name"
              value={formData.recipientName}
              onChange={handleChange}
              required
              style={{ width: 220 }}
            />
          </div>
          <div className="letter-row">
            <textarea
              className="letter-input"
              name="recipientAddress"
              placeholder="Recipient Address"
              value={formData.recipientAddress}
              onChange={handleChange}
              required
              rows={2}
              style={{ width: 350 }}
            />
          </div>
          <div style={{ height: 18 }} />
          <div className="letter-row">
            <b>Subject: Offer of Employment</b>
          </div>
          <div style={{ height: 18 }} />
          <div className="letter-row">
            Dear
            <input
              className="letter-input"
              name="recipientName"
              placeholder="Recipient Name"
              value={formData.recipientName}
              onChange={handleChange}
              required
              style={{ width: 180 }}
            />
            ,
          </div>
          <div className="letter-row letter-body">
            <span>
              We are pleased to offer you the position of
              <input
                className="letter-input"
                name="position"
                placeholder="Position"
                value={formData.position}
                onChange={handleChange}
                required
                style={{ width: 140 }}
              />
              at our company. Your joining date will be
              <input
                className="letter-input"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                required
                style={{ width: 130 }}
              />
              , and your starting annual salary will be
              <input
                className="letter-input"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleChange}
                required
                style={{ width: 100 }}
              />
              .
            </span>
          </div>
          <div className="letter-row">
            <span>Please find below the terms and conditions of your employment:</span>
          </div>
          <div className="letter-terms">
            <ol>
              <li>You will be on a probation period of 6 months from your joining date.</li>
              <li>Your employment is subject to verification of your documents and background.</li>
              <li>You are required to maintain confidentiality of all company information.</li>
              <li>Either party may terminate employment with one month's notice.</li>
              <li>You must adhere to all company policies and code of conduct.</li>
            </ol>
          </div>
          <div className="letter-row">
            We look forward to having you on our team.
          </div>
          <div style={{ height: 18 }} />
          <div className="letter-row">Sincerely,</div>
          <div className="letter-row">
            <input
              className="letter-input"
              name="senderName"
              placeholder="Sender Name"
              value={formData.senderName}
              onChange={handleChange}
              required
              style={{ width: 220 }}
            />
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
      {submitted && (
        <div className="buttons-container">
          <button onClick={handleGenerateAndSavePdf}>Generate PDF</button>
          <button onClick={handleShare}>Share</button>
        </div>
      )}
      {shareableLink && (
        <div className="shareable-link">
          <p>Shareable Link:</p>
          <a href={shareableLink} target="_blank" rel="noopener noreferrer">{shareableLink}</a>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const MerchantSupport = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("faq");
  
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ticket creation
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  // Viewing a single ticket
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [faqRes, ticketRes] = await Promise.all([
          api.get("/support/faqs"),
          api.get("/support/tickets")
        ]);
        setFaqs(faqRes.data.faqs || []);
        setTickets(ticketRes.data.tickets || []);
      } catch (e) {
        console.error("Failed to load support data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) return;
    setContactSending(true);
    try {
      const res = await api.post("/support/tickets", { subject: contactSubject, message: contactMessage });
      if (res.data.status === "success") {
        setTickets([res.data.ticket, ...tickets]);
        setContactSent(true);
        setContactSubject("");
        setContactMessage("");
      }
    } catch (e) {
      console.error("Failed to create ticket", e);
    } finally {
      setContactSending(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;
    setReplySending(true);
    try {
      const res = await api.post(`/support/tickets/${activeTicket.id}/reply`, { message: replyMessage });
      if (res.data.status === "success") {
        // Update local state
        const updatedTicket = {
          ...activeTicket,
          messages: [...activeTicket.messages, res.data.message]
        };
        setActiveTicket(updatedTicket);
        setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setReplyMessage("");
      }
    } catch (e) {
      console.error("Failed to reply", e);
    } finally {
      setReplySending(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto space-y-gutter">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Merchant Support</h2>
        <p className="text-on-surface-variant font-body-md mt-1">Find answers to common questions or reach out to our support team.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2">
        {[
          { id: "faq", label: "FAQ & Knowledge Base", icon: "help" },
          { id: "tickets", label: "My Tickets", icon: "confirmation_number" },
          { id: "contact", label: "Contact Support", icon: "mail" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setContactSent(false); setActiveTicket(null); }}
            className={`px-5 py-2.5 rounded-full font-label-md font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant border border-outline-variant hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="text-lg font-bold text-on-surface">Frequently Asked Questions</h3>
            <p className="text-on-surface-variant text-sm mt-1">Quick answers to the most common merchant questions.</p>
          </div>
          <div className="divide-y divide-outline-variant">
            {loading ? (
              <div className="p-6 text-center text-on-surface-variant">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="p-6 text-center text-on-surface-variant">No FAQs available yet.</div>
            ) : (
              faqs.map((faq, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="font-label-md font-bold text-on-surface pr-4">{faq.question}</span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] flex-shrink-0 transition-transform" style={{ transform: expandedFaq === idx ? "rotate(180deg)" : "rotate(0)" }}>
                      expand_more
                    </span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4 text-on-surface-variant text-sm leading-relaxed bg-surface-container-low/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
          {activeTicket ? (
            <div className="flex flex-col h-[600px]">
              {/* Ticket Header */}
              <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <div>
                  <button onClick={() => setActiveTicket(null)} className="flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-primary mb-2 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to Tickets
                  </button>
                  <h3 className="text-xl font-bold text-on-surface">{activeTicket.subject}</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Ticket #{activeTicket.id} • Opened {new Date(activeTicket.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${activeTicket.status === "OPEN" ? "bg-error/10 text-error" : activeTicket.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600" : "bg-success/10 text-success"}`}>
                  {activeTicket.status.replace("_", " ")}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
                {activeTicket.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "MERCHANT" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === "MERCHANT" ? "bg-primary text-on-primary rounded-tr-sm" : "bg-surface-container-high text-on-surface rounded-tl-sm border border-outline-variant"}`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                      <div className={`text-[10px] mt-2 font-medium ${msg.sender === "MERCHANT" ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                        {msg.sender === "MERCHANT" ? "You" : "Support Agent"} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Area */}
              {activeTicket.status !== "RESOLVED" && (
                <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
                  <form onSubmit={handleReply} className="flex gap-3">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      className="flex-1 border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={replySending || !replyMessage.trim()}
                      className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center transition-all ${replySending || !replyMessage.trim() ? "bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed" : "bg-primary text-on-primary hover:opacity-90"}`}
                    >
                      {replySending ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">My Tickets</h3>
                  <p className="text-on-surface-variant text-sm mt-1">View and manage your support requests.</p>
                </div>
                <button onClick={() => setActiveTab("contact")} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  New Ticket
                </button>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-on-surface-variant">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">confirmation_number</span>
                  <p className="text-on-surface font-bold text-lg">No Tickets Found</p>
                  <p className="text-on-surface-variant text-sm mt-1">You haven't submitted any support requests yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {tickets.map(ticket => (
                    <div key={ticket.id} onClick={() => setActiveTicket(ticket)} className="p-5 hover:bg-surface-container-low transition-colors cursor-pointer flex items-center justify-between group">
                      <div>
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{ticket.subject}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Last updated {new Date(ticket.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === "OPEN" ? "bg-error/10 text-error" : ticket.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600" : "bg-success/10 text-success"}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
            {contactSent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-tertiary text-[36px]">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Message Sent!</h3>
                <p className="text-on-surface-variant text-sm max-w-md">Our support team will review your message and respond within 24-48 hours. You'll receive a reply via email at <strong>{user?.email}</strong>.</p>
                <button
                  onClick={() => { setContactSent(false); setActiveTab("tickets"); }}
                  className="mt-6 px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container transition-colors"
                >
                  View My Tickets
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-on-surface mb-1">Send a Message</h3>
                  <p className="text-on-surface-variant text-sm">Describe your issue and our team will get back to you.</p>
                </div>
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      required
                      placeholder="Brief description of your issue"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm placeholder-on-surface-variant/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Message</label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                      rows="6"
                      placeholder="Provide as much detail as possible..."
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface text-sm resize-none placeholder-on-surface-variant/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={contactSending || !contactSubject.trim() || !contactMessage.trim()}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${contactSending || !contactSubject.trim() || !contactMessage.trim() ? "bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed" : "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]"}`}
                  >
                    {contactSending ? "Sending..." : "Submit Ticket"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Quick Contact Info */}
          <div className="space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                </div>
                <div>
                  <p className="font-label-md font-bold text-on-surface">Response Time</p>
                  <p className="text-on-surface-variant text-xs">24-48 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">mail</span>
                </div>
                <div>
                  <p className="font-label-md font-bold text-on-surface">Email</p>
                  <p className="text-on-surface-variant text-xs">support@tradehub.gh</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">call</span>
                </div>
                <div>
                  <p className="font-label-md font-bold text-on-surface">Phone</p>
                  <p className="text-on-surface-variant text-xs">+233 30 123 4567</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="font-label-md font-bold text-primary mb-1">Pro Tip</p>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Check the FAQ section first — most questions are answered there instantly! For urgent issues related to payments or escrow, include your order ID in the subject line.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantSupport;

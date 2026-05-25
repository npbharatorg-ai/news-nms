import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Link as LinkIcon, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getShareText } from '@/lib/shareUtils.js';

const ShareButtons = ({ articleTitle, articleDescription, articleUrl, reporterName }) => {
  const shareText = getShareText(reporterName, articleTitle);

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + articleUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(articleTitle);
    const body = encodeURIComponent(`${shareText}\n\nRead more here: ${articleUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 share-buttons-group">
      <Button variant="outline" size="icon" onClick={handleWhatsApp} className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Share on WhatsApp">
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleFacebook} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Share on Facebook">
        <Facebook className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleTwitter} className="text-sky-500 hover:text-sky-600 hover:bg-sky-50" title="Share on Twitter">
        <Twitter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleEmail} className="text-gray-600 hover:text-gray-700 hover:bg-gray-50" title="Share via Email">
        <Mail className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleCopyLink} className="text-gray-600 hover:text-gray-700 hover:bg-gray-50" title="Copy Link">
        <LinkIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ShareButtons;
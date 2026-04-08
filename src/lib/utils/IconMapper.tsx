import {
    MdPrecisionManufacturing,
    MdDirectionsCar,
    MdLocationCity,
    MdDeleteOutline,
    MdLanguage,
    MdElectricBolt,
    MdSportsEsports,
    MdEmojiEvents,
} from 'react-icons/md';

/**
 * Maps emojis originally found in the resume markdown to premium React Icons.
 */
export const mapEmojiToIcon = (emoji: string, className?: string) => {
    switch (emoji) {
        case '⚙️':
            return <MdPrecisionManufacturing className={className} />;
        case '🚗':
            return <MdDirectionsCar className={className} />;
        case '🏟️':
            return <MdLocationCity className={className} />;
        case '🗑️':
            return <MdDeleteOutline className={className} />;
        case '🌐':
            return <MdLanguage className={className} />;
        case '⚡':
            return <MdElectricBolt className={className} />;
        case '🎮':
            return <MdSportsEsports className={className} />;
        case '🥇':
            return <MdEmojiEvents className={className} style={{ color: '#ffd700' }} />;
        case '🥈':
            return <MdEmojiEvents className={className} style={{ color: '#c0c0c0' }} />;
        case '🥉':
            return <MdEmojiEvents className={className} style={{ color: '#cd7f32' }} />;
        case '🏅':
            return <MdEmojiEvents className={className} style={{ color: '#ffd700' }} />;
        default:
            return <span className={className}>{emoji}</span>; // fallback
    }
};

export const extractEmojiAndTitle = (fullTitle: string): { emoji: string; title: string } => {
    // Basic regex to match common emojis at the start of the string
    const match = fullTitle.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])\s*(.*)$/);
    if (match && match[1] && match[2]) {
        return { emoji: match[1], title: match[2].trim() };
    }
    return { emoji: '', title: fullTitle };
};

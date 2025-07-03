export function convertToGherkin(bddContent: string): string {
  const bddLines: string[] = [];
  const lines = bddContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('---')) continue;
    
    if (trimmedLine.startsWith('**Given**')) {
      bddLines.push(`Given ${trimmedLine.replace('**Given**', '').trim()}`);
    } else if (trimmedLine.startsWith('**When**')) {
      bddLines.push(`When ${trimmedLine.replace('**When**', '').trim()}`);
    } else if (trimmedLine.startsWith('**Then**')) {
      bddLines.push(`Then ${trimmedLine.replace('**Then**', '').trim()}`);
    } else if (trimmedLine.startsWith('**And**')) {
      bddLines.push(`And ${trimmedLine.replace('**And**', '').trim()}`);
    } else if (trimmedLine.startsWith('Given ') || trimmedLine.startsWith('When ') || 
               trimmedLine.startsWith('Then ') || trimmedLine.startsWith('And ')) {
      bddLines.push(trimmedLine);
    }
  }
  
  return bddLines.length > 0 ? '    ' + bddLines.join('\n    ') : '';
}

export const customPriorityMapping: { [key: string]: string } = {
  'High': 'P0',
  'Medium': 'P1',
  'Low': 'P2'
};

export const priorityMapping: { [key: string]: string } = {
  'High': 'High',
  'Medium': 'High',
  'Low': 'High'
};

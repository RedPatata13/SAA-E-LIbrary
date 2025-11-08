import { Button } from './ui/button'
import { Search, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function SearchButton(){
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5081/api/hello');
      const data = await response.json();
      alert(`Backend response: ${data.message}`);
    } catch (error) {
      alert('Failed to connect to API. Make sure your C# backend is running!');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      aria-label="Search"
      onClick={handleSearchClick}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search />}
    </Button>
  );
}
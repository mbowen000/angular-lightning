public class PageRemoter {
    @remoteAction
    public static PageWrapper getPage(String id) {
        
        // todo: obv dont just create one.. query for it..
        PageWrapper pw = new PageWrapper('Test Page');
        
        // implement
        PageWrapper.cls_sections section1 = new PageWrapper.cls_sections('test section');
        pw.sections.add(section1);
        
        return pw;
    }
    
    @remoteAction
    public static List<PageWrapper> getPages() {
        List<PageWrapper> pws = new List<PageWrapper>();
        
        PageWrapper pw1 = new PageWrapper('Page Wrapper 1');
        PageWrapper pw2 = new PageWrapper('Page Wrapper 2');
        
        pws.add(pw1);
        pws.add(pw2);
        
        return pws;
    }
}